// Regras de negócio da integração com o Mercado Pago (Checkout Pro, modelo marketplace):
//   criarCheckout        -> pedido + reserva de estoque + preferência de pagamento
//   aplicarPagamentoMp   -> traduz o status do MP para pedido/pagamento/estoque (idempotente)
//   consultarStatus      -> usado pela tela de retorno; sincroniza com o MP se o webhook atrasar
//   expirarPedidosAbandonados -> chamado pelo cron

import prisma from '@/src/lib/prisma';
import { mp, urlApp } from '@/src/lib/mercadopago/config';
import {
  buscarPagamento, buscarPagamentosPorReferencia, criarPreferencia, ErroMP,
  type CorpoPreferencia, type PagamentoMP,
} from '@/src/lib/mercadopago/client';
import { tokenDaLoja } from '@/src/lib/mercadopago/contaLoja';
import {
  comissaoCentavos, deCentavos, paraCentavos, precoComDesconto, traduzirStatus,
} from '@/src/lib/mercadopago/precos';

type Tx = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export class ErroCheckout extends Error {
  status: number;
  constructor(mensagem: string, status = 400) {
    super(mensagem);
    this.name = 'ErroCheckout';
    this.status = status;
  }
}

const EXPIRACAO_PREFERENCIA_HORAS = 24;
// Um Pix gerado no fim da validade da preferência ainda vale ~24h. Só depois disso o pedido é abandonado de vez.
const ABANDONO_HORAS = 49;

// ---------------------------------------------------------------- estoque
// Convenção: cada variação tem UMA linha de Estoque (a de menor id é a "principal").

async function estoquePrincipalId(tx: Tx, variacaoId: number) {
  const e = await tx.estoque.findFirst({ where: { produtoVariacaoId: variacaoId }, orderBy: { id: 'asc' }, select: { id: true } });
  return e?.id ?? null;
}

async function reservar(tx: Tx, variacaoId: number, qtd: number, nome: string) {
  const id = await estoquePrincipalId(tx, variacaoId);
  const linhas = id === null ? 0 : await tx.$executeRaw`
    UPDATE "Estoque"
       SET "quantidade_reservada" = "quantidade_reservada" + ${qtd}, "data_atualizacao" = NOW()
     WHERE "id" = ${id} AND "quantidade" - "quantidade_reservada" >= ${qtd}`;
  if (linhas === 0) throw new ErroCheckout(`Estoque insuficiente para "${nome}".`, 409);
}

async function itensComVariacao(tx: Tx, pedidoId: number) {
  const itens = await tx.produtoPedido.findMany({ where: { pedidoId }, select: { produtoVariacaoId: true, quantidade: true } });
  return itens.filter((i) => i.produtoVariacaoId !== null) as { produtoVariacaoId: number; quantidade: number }[];
}

async function liberarReserva(tx: Tx, pedidoId: number) {
  for (const i of await itensComVariacao(tx, pedidoId)) {
    const id = await estoquePrincipalId(tx, i.produtoVariacaoId);
    if (id === null) continue;
    await tx.$executeRaw`
      UPDATE "Estoque"
         SET "quantidade_reservada" = GREATEST("quantidade_reservada" - ${i.quantidade}, 0), "data_atualizacao" = NOW()
       WHERE "id" = ${id}`;
  }
}

/** Pagamento aprovado: a reserva vira baixa definitiva. `tinhaReserva=false` = o pedido já tinha expirado. */
async function confirmarEstoque(tx: Tx, pedidoId: number, tinhaReserva: boolean) {
  for (const i of await itensComVariacao(tx, pedidoId)) {
    const id = await estoquePrincipalId(tx, i.produtoVariacaoId);
    if (id === null) continue;
    if (tinhaReserva) {
      await tx.$executeRaw`
        UPDATE "Estoque"
           SET "quantidade" = GREATEST("quantidade" - ${i.quantidade}, 0),
               "quantidade_reservada" = GREATEST("quantidade_reservada" - ${i.quantidade}, 0),
               "data_atualizacao" = NOW()
         WHERE "id" = ${id}`;
    } else {
      await tx.$executeRaw`
        UPDATE "Estoque" SET "quantidade" = GREATEST("quantidade" - ${i.quantidade}, 0), "data_atualizacao" = NOW() WHERE "id" = ${id}`;
    }
  }
}

/** Cancela o pedido SÓ se ainda for "novo" (isso garante que a reserva é liberada uma única vez). */
async function cancelarSeNovo(tx: Tx, pedidoId: number) {
  const r = await tx.pedido.updateMany({ where: { id: pedidoId, status: 'novo' }, data: { status: 'cancelado' } });
  if (r.count === 1) await liberarReserva(tx, pedidoId);
  return r.count === 1;
}

// ---------------------------------------------------------------- checkout

export interface ItemCheckout { produtoId: number; variacaoId: number | null; quantidade: number }

export async function criarCheckout(entrada: {
  usuarioId: number;
  lojaId: number;
  itens: ItemCheckout[];
  metodo: 'pix' | 'cartao';
}) {
  const { usuarioId, lojaId, metodo } = entrada;
  if (metodo !== 'pix' && metodo !== 'cartao') throw new ErroCheckout('Forma de pagamento inválida.');

  // junta linhas repetidas e valida o formato
  const mapa = new Map<string, ItemCheckout>();
  for (const bruto of entrada.itens ?? []) {
    const produtoId = Number(bruto?.produtoId);
    const variacaoId = bruto?.variacaoId == null ? null : Number(bruto.variacaoId);
    const quantidade = Number(bruto?.quantidade);
    if (!Number.isInteger(produtoId) || produtoId < 1) throw new ErroCheckout('Item inválido.');
    if (variacaoId !== null && (!Number.isInteger(variacaoId) || variacaoId < 1)) throw new ErroCheckout('Item inválido.');
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) throw new ErroCheckout('Quantidade inválida.');
    const k = `${produtoId}:${variacaoId ?? 'x'}`;
    const atual = mapa.get(k);
    if (atual) atual.quantidade += quantidade; else mapa.set(k, { produtoId, variacaoId, quantidade });
  }
  const itens = [...mapa.values()];
  if (itens.length === 0) throw new ErroCheckout('O carrinho está vazio.');
  if (itens.some((i) => i.quantidade > 99)) throw new ErroCheckout('Quantidade inválida.');

  const loja = await prisma.loja.findUnique({ where: { id: lojaId }, include: { mercadoPago: { select: { id: true } } } });
  if (!loja || loja.status !== 'ativo') throw new ErroCheckout('Loja não encontrada.', 404);
  if (!loja.mercadoPago) throw new ErroCheckout('Esta loja ainda não está habilitada para receber pagamentos.', 409);

  const cliente = await prisma.cliente.findFirst({ where: { usuarioId, lojaId } });
  if (!cliente) throw new ErroCheckout('Você precisa ter cadastro nesta loja para comprar.', 403);

  // Preços SEMPRE do banco — o carrinho do navegador não é confiável.
  const produtos = await prisma.produto.findMany({
    where: { id: { in: itens.map((i) => i.produtoId) }, lojaId, status: 'ativo' },
  });
  const variacoes = await prisma.produtoVariacao.findMany({
    where: { id: { in: itens.filter((i) => i.variacaoId !== null).map((i) => i.variacaoId as number) } },
  });

  const linhas = itens.map((i) => {
    const produto = produtos.find((p) => p.id === i.produtoId);
    if (!produto) throw new ErroCheckout('Um dos produtos não está mais disponível.', 409);
    const variacao = i.variacaoId === null ? null : variacoes.find((v) => v.id === i.variacaoId);
    if (i.variacaoId !== null && (!variacao || variacao.produtoId !== produto.id || variacao.status !== 'ativo')) {
      throw new ErroCheckout(`A variação escolhida de "${produto.nome}" não está mais disponível.`, 409);
    }
    const precoOriginal = paraCentavos(variacao?.preco ?? produto.preco);
    if (precoOriginal <= 0) throw new ErroCheckout(`O produto "${produto.nome}" está sem preço.`, 409);
    const precoCobrado = precoComDesconto(precoOriginal, metodo);
    const titulo = variacao ? `${produto.nome} - ${variacao.cor} ${variacao.tamanho}`.slice(0, 250) : produto.nome.slice(0, 250);
    return { ...i, produto, variacao, precoOriginal, precoCobrado, titulo };
  });

  const totalCentavos = linhas.reduce((s, l) => s + l.precoCobrado * l.quantidade, 0);
  const taxa = mp.taxaPercentual();
  const comissao = comissaoCentavos(totalCentavos, taxa);

  // pedido + itens + reserva de estoque + pagamento: tudo ou nada
  const { pedidoId, pagamentoId } = await prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({ data: { status: 'novo', clienteId: cliente.id, lojaId } });
    for (const l of linhas) {
      await tx.produtoPedido.create({
        data: {
          pedidoId: pedido.id,
          produtoId: l.produtoId,
          produtoVariacaoId: l.variacaoId,
          quantidade: l.quantidade,
          preco_unitario: deCentavos(l.precoOriginal),
          subtotal: deCentavos(l.precoOriginal * l.quantidade),
        },
      });
      if (l.variacaoId !== null) await reservar(tx, l.variacaoId, l.quantidade, l.produto.nome);
    }
    const pagamento = await tx.pagamento.create({
      data: {
        pedidoId: pedido.id,
        valor: deCentavos(totalCentavos),
        metodo,
        status: 'pendente',
        codigoTransacao: `ALS-${pedido.id}`,
      },
    });
    return { pedidoId: pedido.id, pagamentoId: pagamento.id };
  });

  // preferência de pagamento na conta do lojista
  try {
    const app = urlApp();
    const https = app.startsWith('https://');
    const retorno = `${app}/loja/${loja.slug}/pagamento/${pedidoId}`;

    const [primeiroNome, ...sobrenome] = cliente.nome.trim().split(/\s+/);
    const cpf = cliente.cpf.replace(/\D/g, '');
    let tel = cliente.telefone.replace(/\D/g, '');
    if (tel.length > 11 && tel.startsWith('55')) tel = tel.slice(2);

    const corpo: CorpoPreferencia = {
      items: linhas.map((l) => ({
        id: String(l.variacaoId ?? l.produtoId),
        title: l.titulo,
        quantity: l.quantidade,
        unit_price: deCentavos(l.precoCobrado),
        currency_id: 'BRL',
      })),
      payer: {
        name: primeiroNome,
        surname: sobrenome.join(' ') || undefined,
        email: cliente.email,
        ...(tel.length >= 10 ? { phone: { area_code: tel.slice(0, 2), number: tel.slice(2) } } : {}),
        ...(cpf.length === 11 ? { identification: { type: 'CPF' as const, number: cpf } } : {}),
      },
      external_reference: String(pedidoId),
      back_urls: { success: retorno, pending: retorno, failure: retorno },
      notification_url: `${app}/api/webhook/mercadopago?lojaId=${lojaId}`,
      ...(https ? { auto_return: 'approved' as const } : {}), // auto_return exige back_urls https
      statement_descriptor: loja.nome.normalize('NFD').replace(/[^\w ]/g, '').toUpperCase().slice(0, 16) || 'ALLYSTORE',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + EXPIRACAO_PREFERENCIA_HORAS * 3600 * 1000).toISOString(),
      payment_methods: metodo === 'pix'
        ? { excluded_payment_types: ['credit_card', 'debit_card', 'ticket', 'atm', 'prepaid_card', 'account_money'].map((id) => ({ id })) }
        : { excluded_payment_types: ['bank_transfer', 'debit_card', 'ticket', 'atm', 'prepaid_card', 'account_money'].map((id) => ({ id })), installments: 3 },
      ...(comissao > 0 ? { marketplace_fee: deCentavos(comissao) } : {}),
    };

    const token = await tokenDaLoja(lojaId);
    const pref = await criarPreferencia(token, corpo, `ALS-${pedidoId}-${Date.now()}`);
    const initPoint = pref.init_point;

    await prisma.pagamento.update({
      where: { id: pagamentoId },
      data: { mpPreferenceId: pref.id, mpInitPoint: initPoint },
    });
    return { pedidoId, initPoint, total: deCentavos(totalCentavos) };
  } catch (e) {
    // não deixa pedido "fantasma" segurando estoque
    await prisma.$transaction(async (tx) => {
      await cancelarSeNovo(tx, pedidoId);
      await tx.pagamento.update({ where: { id: pagamentoId }, data: { status: 'cancelado' } });
    }).catch((e2) => console.error('[checkout] falha ao desfazer pedido', pedidoId, e2));
    if (e instanceof ErroMP) {
      throw new ErroCheckout('Não foi possível iniciar o pagamento agora. Tente novamente em instantes.', 502);
    }
    throw e;
  }
}

// ---------------------------------------------------------------- sincronização

export async function aplicarPagamentoMp(pagMp: PagamentoMP, lojaId: number) {
  const pedidoId = Number(pagMp.external_reference);
  if (!Number.isInteger(pedidoId)) return { ignorado: 'pagamento sem referência de pedido' };

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { pagamento: { orderBy: { id: 'desc' }, take: 1 } },
  });
  const pagamento = pedido?.pagamento[0];
  if (!pedido || !pagamento || pedido.lojaId !== lojaId) return { ignorado: 'pedido não encontrado nesta loja' };

  const novo = traduzirStatus(pagMp.status);
  const idMp = String(pagMp.id);
  const mesmoPagamentoMp = pagamento.mpPaymentId === idMp;

  if (novo.pagamento === 'aprovado' && Math.abs(paraCentavos(pagMp.transaction_amount) - paraCentavos(pagamento.valor)) > 1) {
    console.error('[mercadopago] valor divergente', { pedidoId, mp: pagMp.transaction_amount, esperado: String(pagamento.valor) });
    return { ignorado: 'valor divergente' };
  }

  // eventos fora de ordem / repetidos não podem desfazer o que já está resolvido
  if (pagamento.status === 'aprovado' && !mesmoPagamentoMp) return { ignorado: 'pedido já pago por outra tentativa' };
  if (pagamento.status === 'aprovado' && novo.pagamento === 'pendente') return { ignorado: 'evento antigo' };
  if (pagamento.status === 'estornado') return { ignorado: 'pagamento já estornado' };
  if (pagamento.status === novo.pagamento && mesmoPagamentoMp) return { pedidoId, pagamento: pagamento.status, repetido: true };

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.update({
      where: { id: pagamento.id },
      data: {
        status: novo.pagamento,
        mpPaymentId: idMp,
        mpStatusDetalhe: pagMp.status_detail ?? null,
        ...(novo.pagamento === 'aprovado' ? { dataPagamento: new Date() } : {}),
      },
    });

    if (novo.pagamento === 'aprovado') {
      const r = await tx.pedido.updateMany({ where: { id: pedidoId, status: 'novo' }, data: { status: 'pago' } });
      if (r.count === 1) {
        await confirmarEstoque(tx, pedidoId, true);
      } else {
        // pagamento chegou depois do pedido ser cancelado/expirado: o cliente pagou, então o pedido vale
        const tardio = await tx.pedido.updateMany({ where: { id: pedidoId, status: 'cancelado' }, data: { status: 'pago' } });
        if (tardio.count === 1) {
          console.warn('[mercadopago] pagamento aprovado em pedido já cancelado; reativado', pedidoId);
          await confirmarEstoque(tx, pedidoId, false);
        }
      }
    } else if (novo.pagamento === 'cancelado') {
      await cancelarSeNovo(tx, pedidoId);
    } else if (novo.pagamento === 'estornado') {
      // não devolve estoque sozinho (a mercadoria pode já ter saído); o lojista decide
      await tx.pedido.updateMany({ where: { id: pedidoId, status: { in: ['novo', 'pago'] } }, data: { status: 'cancelado' } });
    }
  });

  return { pedidoId, pagamento: novo.pagamento };
}

export async function sincronizarPagamento(paymentId: string | number, lojaId: number) {
  const token = await tokenDaLoja(lojaId);
  // sempre confirmamos direto na API do MP com o token da loja: o que vem no webhook nunca é confiado
  const pagMp = await buscarPagamento(token, paymentId);
  return aplicarPagamentoMp(pagMp, lojaId);
}

// ---------------------------------------------------------------- consulta (tela de retorno)

export async function consultarStatus(usuarioId: number, pedidoId: number, paymentId?: string | null) {
  const carregar = () => prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { cliente: { select: { usuarioId: true } }, pagamento: { orderBy: { id: 'desc' }, take: 1 } },
  });

  let pedido = await carregar();
  if (!pedido || pedido.cliente.usuarioId !== usuarioId) throw new ErroCheckout('Pedido não encontrado.', 404);

  const aguardando = (s?: string) => s === 'pendente' || s === 'recusado';
  if (aguardando(pedido.pagamento[0]?.status)) {
    try {
      if (paymentId) {
        await sincronizarPagamento(paymentId, pedido.lojaId);
      } else {
        const token = await tokenDaLoja(pedido.lojaId);
        const achados = await buscarPagamentosPorReferencia(token, pedidoId);
        const alvo = achados.find((p) => p.status === 'approved') ?? achados[0];
        if (alvo) await aplicarPagamentoMp(alvo, pedido.lojaId);
      }
      pedido = await carregar();
    } catch (e) {
      console.error('[checkout] não foi possível sincronizar com o Mercado Pago', e); // o webhook ainda resolve
    }
  }

  const pg = pedido!.pagamento[0];
  return {
    pedidoId,
    pedidoStatus: pedido!.status,
    pagamento: pg ? {
      status: pg.status,
      metodo: pg.metodo,
      valor: Number(pg.valor.toString()),
      detalhe: pg.mpStatusDetalhe,
      // link para retomar o pagamento, só enquanto ainda faz sentido
      linkPagamento: aguardando(pg.status) && pedido!.status === 'novo' ? pg.mpInitPoint : null,
    } : null,
  };
}

// ---------------------------------------------------------------- cron

/** Pedidos "novo" sem pagamento há mais de ABANDONO_HORAS: cancela e devolve a reserva ao estoque. */
export async function expirarPedidosAbandonados() {
  const limite = new Date(Date.now() - ABANDONO_HORAS * 3600 * 1000);
  const candidatos = await prisma.pedido.findMany({
    where: { status: 'novo', data: { lt: limite }, pagamento: { some: { status: { in: ['pendente', 'recusado'] } } } },
    select: { id: true },
    take: 200,
  });

  let expirados = 0;
  for (const { id } of candidatos) {
    const ok = await prisma.$transaction(async (tx) => {
      const cancelou = await cancelarSeNovo(tx, id);
      if (cancelou) await tx.pagamento.updateMany({ where: { pedidoId: id, status: { in: ['pendente', 'recusado'] } }, data: { status: 'expirado' } });
      return cancelou;
    });
    if (ok) expirados++;
  }
  return { verificados: candidatos.length, expirados };
}
