'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api } from '@/src/lib/api';
import { dataCurta, fmt } from '@/src/lib/format';
import { sessaoLojista } from '@/src/lib/session';
import {
  Avatar, Badge, Card, SearchInput, PageHeader, OrderStatusBadge,
  Table, Thead, Th, Td, Tr, Loading, ErrorState, EmptyState, IconClipboard,
} from '@/src/components/ui';
import type { Pagamento, Pedido, ProdutoPedido } from '@/src/lib/types';

export default function PedidosPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const carregar = async () => {
    const sessao = sessaoLojista.ler();
    if (!sessao) return;
    setCarregando(true);
    setErro(null);
    try {
      const [peds, pps, pags] = await Promise.all([
        api.pedido.listar(), api.produtoPedido.listar(), api.pagamento.listar(),
      ]);
      setPedidos(peds.filter((p) => Number(p.lojaId) === sessao.loja.id).sort((a, b) => Number(b.id) - Number(a.id)));
      setItens(pps);
      setPagamentos(pags);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar pedidos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const totalDoPedido = (id: number) =>
    itens.filter((i) => Number(i.pedidoId) === id).reduce((s, i) => s + Number(i.subtotal), 0);
  const qtdItens = (id: number) => itens.filter((i) => Number(i.pedidoId) === id).length;
  const pagamentoDoPedido = (id: number) =>
    pagamentos.filter((p) => Number(p.pedidoId) === id).sort((a, b) => Number(b.id) - Number(a.id))[0];

  const filtrados = useMemo(() => pedidos.filter((p) => {
    const alvo = `${p.id} ${p.cliente?.nome ?? ''}`.toLowerCase();
    return alvo.includes(busca.toLowerCase()) && (filtro === 'todos' || p.status === filtro);
  }), [pedidos, busca, filtro]);

  const contagens = {
    novo: pedidos.filter((p) => p.status === 'novo').length,
    pago: pedidos.filter((p) => p.status === 'pago').length,
    preparacao: pedidos.filter((p) => p.status === 'preparacao').length,
    enviado: pedidos.filter((p) => p.status === 'enviado').length,
  };

  return (
    <MerchantLayout title="Pedidos">
      <PageHeader title="Pedidos" description={`${pedidos.length} pedidos no total`} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Novos', value: contagens.novo, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Pagos', value: contagens.pago, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Em preparação', value: contagens.preparacao, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Enviados', value: contagens.enviado, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-xl border ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <SearchInput placeholder="Buscar por pedido ou cliente..." value={busca} onChange={setBusca} />
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white"
          >
            <option value="todos">Todos</option>
            <option value="novo">Novo</option>
            <option value="pago">Pago</option>
            <option value="preparacao">Em preparação</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {carregando ? <Loading /> : erro ? <ErrorState message={erro} onRetry={carregar} /> : filtrados.length === 0 ? (
          <EmptyState icon={<IconClipboard className="w-8 h-8" />} title="Nenhum pedido encontrado" description="Assim que sua loja receber pedidos, eles aparecem aqui." />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Pedido</Th><Th>Cliente</Th><Th>Data</Th><Th>Itens</Th><Th>Total</Th><Th>Pagamento</Th><Th>Status</Th></tr>
            </Thead>
            <tbody>
              {filtrados.map((o) => {
                const pag = pagamentoDoPedido(o.id);
                return (
                  <Tr key={o.id} onClick={() => router.push(`/painel/pedidos/${o.id}`)}>
                    <Td><span className="font-semibold text-indigo-600">#{o.id}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={o.cliente?.nome ?? '?'} size="sm" />
                        <span className="text-sm">{o.cliente?.nome ?? '—'}</span>
                      </div>
                    </Td>
                    <Td><span className="text-slate-500">{dataCurta(o.data)}</span></Td>
                    <Td><span className="text-slate-600">{qtdItens(o.id)} item(s)</span></Td>
                    <Td><span className="font-semibold">{fmt(totalDoPedido(o.id))}</span></Td>
                    <Td>
                      <Badge color={pag?.status === 'aprovado' ? 'green' : pag?.status === 'cancelado' ? 'red' : 'yellow'}>
                        {pag ? (pag.status === 'aprovado' ? 'Pago' : pag.status === 'cancelado' ? 'Cancelado' : 'Pendente') : '—'}
                      </Badge>
                    </Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </MerchantLayout>
  );
}
