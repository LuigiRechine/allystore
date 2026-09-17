'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/src/components/AdminLayout';
import { api } from '@/src/lib/api';
import { dataCurta, fmt } from '@/src/lib/format';
import {
  Badge, BarChart, Card, StatCard, Table, Thead, Th, Td, Tr, Loading, ErrorState,
  IconStore, IconCheck, IconGrid, IconTrendingUp,
} from '@/src/components/ui';
import type { Loja, Pedido, ProdutoPedido } from '@/src/lib/types';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [ls, ps, pps] = await Promise.all([
        api.loja.listar(), api.pedido.listar(), api.produtoPedido.listar(),
      ]);
      setLojas(ls); setPedidos(ps); setItens(pps);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o painel.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const metricas = useMemo(() => {
    const totalPorPedido = new Map<number, number>();
    for (const i of itens) {
      totalPorPedido.set(Number(i.pedidoId), (totalPorPedido.get(Number(i.pedidoId)) ?? 0) + Number(i.subtotal));
    }
    const receitaPorLoja = new Map<number, number>();
    const pedidosPorLoja = new Map<number, number>();
    for (const p of pedidos) {
      const lojaId = Number(p.lojaId);
      pedidosPorLoja.set(lojaId, (pedidosPorLoja.get(lojaId) ?? 0) + 1);
      if (!['novo', 'cancelado'].includes(p.status)) {
        receitaPorLoja.set(lojaId, (receitaPorLoja.get(lojaId) ?? 0) + (totalPorPedido.get(p.id) ?? 0));
      }
    }

    const agora = new Date();
    const semana = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(agora);
      d.setDate(agora.getDate() - (6 - idx));
      const chave = d.toDateString();
      const valor = pedidos
        .filter((p) => new Date(p.data).toDateString() === chave && !['novo', 'cancelado'].includes(p.status))
        .reduce((s, p) => s + (totalPorPedido.get(p.id) ?? 0), 0);
      return { label: DIAS[d.getDay()], value: valor };
    });

    const gmv = [...receitaPorLoja.values()].reduce((s, v) => s + v, 0);

    return {
      totalLojas: lojas.length,
      ativas: lojas.filter((l) => l.status === 'ativo').length,
      totalPedidos: pedidos.length,
      gmv,
      semana,
      receitaPorLoja,
      pedidosPorLoja,
      recentes: [...lojas].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4),
    };
  }, [lojas, pedidos, itens]);

  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AdminLayout title="Dashboard da Plataforma">
      {carregando ? <Loading /> : erro ? <ErrorState message={erro} onRetry={carregar} /> : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Visão geral da plataforma</h2>
            <p className="text-sm text-slate-500">{hoje}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total de lojas" value={String(metricas.totalLojas)} icon={<IconStore className="w-5 h-5" />} color="indigo" />
            <StatCard
              label="Lojas ativas"
              value={String(metricas.ativas)}
              sub={metricas.totalLojas ? `${Math.round((metricas.ativas / metricas.totalLojas) * 100)}% do total` : undefined}
              icon={<IconCheck className="w-5 h-5" />}
              color="green"
            />
            <StatCard label="Total de pedidos" value={String(metricas.totalPedidos)} icon={<IconGrid className="w-5 h-5" />} color="purple" />
            <StatCard label="GMV da plataforma" value={fmt(metricas.gmv)} sub="Somando todas as lojas" icon={<IconTrendingUp className="w-5 h-5" />} color="amber" />
          </div>

          <Card className="p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Volume de transações da semana</h3>
              <Badge color="indigo">Últimos 7 dias</Badge>
            </div>
            <BarChart data={metricas.semana} />
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>Total: {fmt(metricas.semana.reduce((s, d) => s + d.value, 0))}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Lojas recentes</h3>
              <Link href="/admin/lojas" className="text-xs text-indigo-600 hover:underline">Ver todas</Link>
            </div>
            <Table>
              <Thead>
                <tr><Th>Loja</Th><Th>Criada em</Th><Th>Status</Th><Th>Pedidos</Th><Th>Receita</Th></tr>
              </Thead>
              <tbody>
                {metricas.recentes.map((s) => (
                  <Tr key={s.id} onClick={() => router.push('/admin/lojas')}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">
                          {s.nome[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{s.nome}</p>
                          <p className="text-xs text-slate-400">/{s.slug}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="text-slate-500 text-sm">{dataCurta(s.dataCriacao)}</span></Td>
                    <Td>
                      <Badge color={s.status === 'ativo' ? 'green' : s.status === 'pendente' ? 'yellow' : 'red'}>
                        {s.status === 'ativo' ? 'Ativa' : s.status === 'pendente' ? 'Pendente' : 'Inativa'}
                      </Badge>
                    </Td>
                    <Td>{metricas.pedidosPorLoja.get(s.id) ?? 0}</Td>
                    <Td><span className="font-semibold">{fmt(metricas.receitaPorLoja.get(s.id) ?? 0)}</span></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
