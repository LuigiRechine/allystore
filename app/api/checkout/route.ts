import { NextResponse } from 'next/server';
import { lerSessao } from '@/src/lib/auth';
import { criarCheckout, ErroCheckout } from '@/src/service/mercadoPagoService';

// Cria pedido + reserva de estoque + preferência do Mercado Pago, tudo no servidor.
// Body: { lojaId, metodo: 'pix' | 'cartao', itens: [{ produtoId, variacaoId, quantidade }] }
// O cliente NÃO envia preço, total nem status: isso é calculado aqui.

export async function POST(req: Request) {
  try {
    const sessao = await lerSessao();
    if (!sessao || sessao.tipo !== 'cliente') {
      return NextResponse.json({ erro: 'Faça login para continuar.' }, { status: 401 });
    }
    const body = await req.json();
    const r = await criarCheckout({
      usuarioId: sessao.id,
      lojaId: Number(body.lojaId),
      metodo: body.metodo,
      itens: Array.isArray(body.itens) ? body.itens : [],
    });
    return NextResponse.json(r, { status: 201 });
  } catch (e) {
    if (e instanceof ErroCheckout) return NextResponse.json({ erro: e.message }, { status: e.status });
    console.error('[checkout]', e);
    return NextResponse.json({ erro: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
