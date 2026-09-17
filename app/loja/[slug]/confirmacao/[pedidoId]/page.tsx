'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { StoreNav } from '@/src/components/StoreChrome';
import { Badge, Button, Divider, Img, Placeholder, Loading, ErrorState, IconCheck } from '@/src/components/ui';
import type { Imagem, Pagamento, Pedido, ProdutoPedido } from '@/src/lib/types';

export default function ConfirmacaoPage({ params }: { params: Promise<{ slug: string; pedidoId: string }> }) {
  const { pedidoId } = use(params);
  const loja = useLoja();
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, pps, pagamentos, imgs] = await Promise.all([
        api.pedido.buscar(pedidoId),
        api.produtoPedido.listar(),
        api.pagamento.listar(),
        api.imagem.listar(),
      ]);
      setPedido(p);
      setItens(pps.filter((x) => Number(x.pedidoId) === Number(pedidoId)));
      setPagamento(pagamentos.filter((x) => Number(x.pedidoId) === Number(pedidoId)).sort((a, b) => Number(b.id) - Number(a.id))[0] ?? null);
      setImagens(imgs);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o pedido.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pedidoId]);

  if (carregando) return <div className="min-h-screen bg-slate-50"><StoreNav /><Loading /></div>;
  if (erro || !pedido) {
    return <div className="min-h-screen bg-slate-50"><StoreNav /><ErrorState message={erro ?? 'Pedido não encontrado.'} onRetry={carregar} /></div>;
  }

  const total = itens.reduce((s, i) => s + Number(i.subtotal), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreNav />
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <IconCheck className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Pedido confirmado!</h1>
        <p className="text-slate-600 mt-2 mb-2">
          Obrigada pela sua compra{pedido.cliente?.nome ? `, ${pedido.cliente.nome.split(' ')[0]}` : ''}!
        </p>
        <p className="text-indigo-600 font-semibold text-lg mb-6">#{pedido.id}</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500">Pagamento</span>
            <Badge color={pagamento?.status === 'aprovado' ? 'green' : 'yellow'}>
              {pagamento?.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-slate-900">{fmt(pagamento?.valor ?? total)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-slate-500">Entrega</span>
            <span className="font-medium text-slate-800">A combinar com a loja</span>
          </div>
          <Divider />
          {itens.map((item) => {
            const img = imagens.find((i) => Number(i.produtoId) === Number(item.produtoId))?.url ?? null;
            return (
              <div key={item.id} className="flex gap-3 mt-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {img ? <Img src={img} alt="" className="w-full h-full object-cover" /> : <Placeholder />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-slate-800 truncate">{item.produto?.nome ?? `Produto #${item.produtoId}`}</p>
                  <p className="text-xs text-slate-500">Qtd: {item.quantidade}</p>
                </div>
                <p className="text-xs font-bold text-slate-900">{fmt(item.subtotal)}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => router.push(`/loja/${loja.slug}/conta`)}>Ver meus pedidos</Button>
          <Button variant="outline" fullWidth onClick={() => router.push(`/loja/${loja.slug}`)}>Voltar à loja</Button>
        </div>
      </div>
    </div>
  );
}
