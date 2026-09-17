'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api } from '@/src/lib/api';
import { dataHora, fmt } from '@/src/lib/format';
import {
  Avatar, Button, Card, Divider, Img, Placeholder, Select, OrderStatusBadge,
  Loading, ErrorState, useToast, IconCheck, STATUS_PEDIDO,
} from '@/src/components/ui';
import type { Imagem, Pagamento, Pedido, ProdutoPedido } from '@/src/lib/types';

const TIMELINE = [
  { id: 'novo', label: 'Pedido realizado' },
  { id: 'pago', label: 'Pagamento aprovado' },
  { id: 'preparacao', label: 'Em preparação' },
  { id: 'enviado', label: 'Enviado' },
  { id: 'entregue', label: 'Entregue' },
];

export default function PedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { show, ToastEl } = useToast();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState('novo');
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, pps, pags, imgs] = await Promise.all([
        api.pedido.buscar(id), api.produtoPedido.listar(), api.pagamento.listar(), api.imagem.listar(),
      ]);
      setPedido(p);
      setStatus(p.status);
      setItens(pps.filter((x) => Number(x.pedidoId) === Number(id)));
      setPagamento(pags.filter((x) => Number(x.pedidoId) === Number(id)).sort((a, b) => Number(b.id) - Number(a.id))[0] ?? null);
      setImagens(imgs);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o pedido.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const atualizarStatus = async () => {
    if (!pedido) return;
    setSalvando(true);
    try {
      await api.pedido.atualizar(pedido.id, { status, clienteId: pedido.clienteId, lojaId: pedido.lojaId });
      setPedido({ ...pedido, status });
      show('Status do pedido atualizado!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao atualizar.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <MerchantLayout title="Pedido"><Loading /></MerchantLayout>;
  if (erro || !pedido) return <MerchantLayout title="Pedido"><ErrorState message={erro ?? 'Pedido não encontrado.'} onRetry={carregar} /></MerchantLayout>;

  const subtotal = itens.reduce((s, i) => s + Number(i.subtotal), 0);
  const total = Number(pagamento?.valor ?? subtotal);
  const indiceAtual = TIMELINE.findIndex((t) => t.id === pedido.status);

  return (
    <MerchantLayout title={`Pedido #${pedido.id}`}>
      {ToastEl}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.push('/painel/pedidos')} className="text-slate-500 hover:text-slate-700 text-sm">← Pedidos</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-900">#{pedido.id}</span>
        <OrderStatusBadge status={pedido.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Itens do pedido</h2>
            <div className="space-y-4">
              {itens.map((item) => {
                const img = imagens.find((i) => Number(i.produtoId) === Number(item.produtoId))?.url ?? null;
                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {img ? <Img src={img} alt="" className="w-full h-full object-cover" /> : <Placeholder />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{item.produto?.nome ?? `Produto #${item.produtoId}`}</p>
                      <p className="text-xs text-slate-500">Qtd: {item.quantidade} × {fmt(item.preco_unitario)}</p>
                    </div>
                    <p className="font-semibold text-slate-900">{fmt(item.subtotal)}</p>
                  </div>
                );
              })}
              <div className="border-t border-slate-100 pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {total !== subtotal && (
                  <div className="flex justify-between text-slate-600">
                    <span>Desconto</span><span className="text-emerald-600">-{fmt(subtotal - total)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 text-base pt-1"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Acompanhamento do pedido</h2>
            <div className="flex items-start">
              {TIMELINE.map((t, i) => {
                const feito = indiceAtual >= i && pedido.status !== 'cancelado';
                return (
                  <div key={t.id} className="flex-1 flex flex-col items-center relative">
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-px ${indiceAtual > i && pedido.status !== 'cancelado' ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${feito ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {feito ? <IconCheck className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>}
                    </div>
                    <p className={`text-xs font-medium text-center mt-2 px-1 ${feito ? 'text-indigo-700' : 'text-slate-400'}`}>{t.label}</p>
                  </div>
                );
              })}
            </div>

            <Divider />
            <div className="flex items-end gap-3 flex-wrap">
              <Select label="Atualizar status" value={status} onChange={(e) => setStatus(e.target.value)} className="min-w-48">
                {STATUS_PEDIDO.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </Select>
              <Button onClick={atualizarStatus} disabled={salvando || status === pedido.status}>
                {salvando ? 'Salvando...' : 'Atualizar'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Cliente</h2>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={pedido.cliente?.nome ?? '?'} />
              <div className="min-w-0">
                <p className="font-medium text-slate-900 text-sm truncate">{pedido.cliente?.nome ?? '—'}</p>
                <p className="text-xs text-slate-500">Cliente da loja</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>{pedido.cliente?.email ?? '—'}</p>
              <p>{pedido.cliente?.telefone ?? '—'}</p>
              {pedido.cliente?.cpf && <p>CPF: {pedido.cliente.cpf}</p>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Pagamento</h2>
            {pagamento ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${pagamento.status === 'aprovado' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <IconCheck className={`w-3.5 h-3.5 ${pagamento.status === 'aprovado' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  </div>
                  <span className={`text-sm font-medium capitalize ${pagamento.status === 'aprovado' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {pagamento.metodo} {pagamento.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{dataHora(pagamento.dataPagamento)}</p>
                <p className="text-xs text-slate-500 mt-1">Valor: <strong>{fmt(pagamento.valor)}</strong></p>
                <p className="text-xs text-slate-400 mt-1 break-all">{pagamento.codigoTransacao}</p>
              </>
            ) : (
              <p className="text-xs text-slate-500">Nenhum pagamento registrado.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Dados do pedido</h2>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Criado em: {dataHora(pedido.data)}</p>
              <p>Loja: {pedido.loja?.nome ?? '—'}</p>
            </div>
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}
