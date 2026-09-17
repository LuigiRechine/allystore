'use client';

// Fluxo real de checkout:
//   1. POST /api/pedido           -> cria o pedido (status "novo")
//   2. POST /api/produtoPedido    -> um por item do carrinho
//   3. POST /api/pagamento        -> pagamento pendente (pix ou cartao)
//   4. redireciona para a tela de pagamento

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { useCarrinho } from '@/src/context/CarrinhoContext';
import { sessaoCliente, type SessaoCliente } from '@/src/lib/session';
import { StoreNav } from '@/src/components/StoreChrome';
import {
  Badge, Button, Divider, Img, Input, Placeholder, Select, Loading,
  IconChevronLeft, IconChevronRight, IconShield,
} from '@/src/components/ui';

export default function CheckoutPage() {
  const loja = useLoja();
  const router = useRouter();
  const { itens, subtotal, limpar, pronto } = useCarrinho();

  const [sessao, setSessao] = useState<SessaoCliente | null>(null);
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Endereço fica só no navegador: o schema atual não tem tabela de endereço.
  // Se quiser persistir, crie um model `Endereco` ligado a Cliente.
  const [endereco, setEndereco] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'SP',
  });

  useEffect(() => {
    const s = sessaoCliente.ler(loja.slug);
    if (!s) {
      router.replace(`/loja/${loja.slug}/entrar?redirect=checkout`);
      return;
    }
    setSessao(s);
  }, [loja.slug, router]);

  useEffect(() => {
    if (pronto && itens.length === 0 && !enviando) {
      router.replace(`/loja/${loja.slug}/carrinho`);
    }
  }, [pronto, itens.length, enviando, loja.slug, router]);

  const desconto = metodo === 'pix' ? subtotal * 0.1 : 0;
  const total = subtotal - desconto;

  const finalizar = async () => {
    if (!sessao) return;
    setEnviando(true);
    setErro(null);
    try {
      const pedido = await api.pedido.criar({
        status: 'novo',
        clienteId: sessao.cliente.id,
        lojaId: loja.id,
      });

      for (const item of itens) {
        await api.produtoPedido.criar({
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.preco * item.quantidade,
          pedidoId: pedido.id,
          produtoId: item.produtoId,
        });
      }

      await api.pagamento.criar({
        valor: total,
        metodo,
        status: 'pendente',
        codigoTransacao: `ALS-${pedido.id}-${Date.now().toString(36).toUpperCase()}`,
        pedidoId: pedido.id,
      });

      limpar();
      router.push(`/loja/${loja.slug}/pagamento/${pedido.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível finalizar o pedido.');
      setEnviando(false);
    }
  };

  if (!sessao || !pronto) return <div className="min-h-screen bg-slate-50"><StoreNav /><Loading /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreNav />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/loja/${loja.slug}/carrinho`} className="text-slate-500 hover:text-slate-700">
            <IconChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Finalizar Compra</h1>
        </div>

        <div className="flex items-center gap-3 text-sm mb-8">
          {['Carrinho', 'Dados', 'Pagamento'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <IconChevronRight className="w-4 h-4 text-slate-300" />}
              <span className={i === 1 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}>{s}</span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Dados pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Nome completo" defaultValue={sessao.cliente.nome} readOnly />
                <Input label="E-mail" type="email" defaultValue={sessao.cliente.email} readOnly />
                <Input label="CPF" defaultValue={sessao.cliente.cpf} readOnly />
                <Input label="Telefone" defaultValue={sessao.cliente.telefone} readOnly />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Para alterar seus dados, acesse <Link href={`/loja/${loja.slug}/conta`} className="text-indigo-600 hover:underline">Minha conta</Link>.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Endereço de entrega</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="CEP" placeholder="00000-000" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} />
                <Input label="Rua" placeholder="Nome da rua" className="sm:col-span-2" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} />
                <Input label="Número" placeholder="000" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
                <Input label="Complemento" placeholder="Apto, bloco..." className="sm:col-span-2" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
                <Input label="Bairro" placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
                <Input label="Cidade" placeholder="Cidade" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} />
                <Select label="Estado" value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}>
                  {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Forma de pagamento</h2>
              <div className="flex gap-3 flex-col sm:flex-row">
                {[
                  { id: 'pix' as const, label: 'Pix', badge: '10% off' },
                  { id: 'cartao' as const, label: 'Cartão de crédito', badge: '3x sem juros' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex-1 border rounded-xl p-4 cursor-pointer transition-colors ${metodo === opt.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <input type="radio" name="pagamento" value={opt.id} checked={metodo === opt.id} onChange={() => setMetodo(opt.id)} className="sr-only" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-slate-900">{opt.label}</span>
                      <Badge color={opt.id === 'pix' ? 'green' : 'indigo'}>{opt.badge}</Badge>
                    </div>
                    {opt.id === 'pix' && <p className="text-xs text-slate-500">Pague com QR Code ou código copia e cola</p>}
                    {opt.id === 'cartao' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input placeholder="Número do cartão" />
                        <Input placeholder="Nome no cartão" />
                        <Input placeholder="MM/AA" />
                        <Input placeholder="CVV" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20">
              <h2 className="font-bold text-slate-900 mb-4">Seu pedido</h2>
              {itens.map((item) => (
                <div key={`${item.produtoId}-${item.variacaoId ?? 'x'}`} className="flex gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.imagem ? <Img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.nome}</p>
                    <p className="text-xs text-slate-500">Qtd: {item.quantidade}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{fmt(item.preco * item.quantidade)}</p>
                </div>
              ))}
              <Divider />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {metodo === 'pix' && (
                  <div className="flex justify-between text-emerald-600 font-medium"><span>Desconto Pix (10%)</span><span>-{fmt(desconto)}</span></div>
                )}
                <Divider />
                <div className="flex justify-between font-bold text-slate-900"><span>Total</span><span>{fmt(total)}</span></div>
              </div>

              {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}

              <Button fullWidth size="lg" className="mt-5" onClick={finalizar} disabled={enviando}>
                {enviando ? 'Processando...' : metodo === 'pix' ? 'Gerar QR Code Pix' : 'Pagar agora'}
              </Button>
              <div className="flex items-center gap-2 mt-3 justify-center">
                <IconShield className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs text-slate-400">Compra 100% segura</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
