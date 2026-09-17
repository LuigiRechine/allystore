'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api, estoqueDoProduto, imagemPrincipal } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { sessaoLojista } from '@/src/lib/session';
import {
  Badge, BarChart, Button, Card, Img, Placeholder, StatCard, Table, Thead, Th, Td, Tr,
  OrderStatusBadge, Loading, ErrorState, EmptyState,
  IconPlus, IconClipboard, IconPackage, IconTrendingUp, IconAlertTriangle,
} from '@/src/components/ui';
import type { Estoque, Imagem, Pedido, Produto, ProdutoPedido, ProdutoVariacao } from '@/src/lib/types';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DashboardPage() {
  const router = useRouter();
  const [dados, setDados] = useState<{
    produtos: Produto[]; pedidos: Pedido[]; itens: ProdutoPedido[];
    imagens: Imagem[]; variacoes: ProdutoVariacao[]; estoques: Estoque[];
  } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    const sessao = sessaoLojista.ler();
    if (!sessao) return;
    setCarregando(true);
    setErro(null);
    try {
      const [ps, peds, itens, imgs, vars, ests] = await Promise.all([
        api.produto.listar(), api.pedido.listar(), api.produtoPedido.listar(),
        api.imagem.listar(), api.produtoVariacao.listar(), api.estoque.listar(),
      ]);
      setDados({
        produtos: ps.filter((p) => Number(p.lojaId) === sessao.loja.id),
        pedidos: peds.filter((p) => Number(p.lojaId) === sessao.loja.id),
        itens, imagens: imgs, variacoes: vars, estoques: ests,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o dashboard.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const metricas = useMemo(() => {
    if (!dados) return null;
    const idsPedidos = new Set(dados.pedidos.map((p) => p.id));
    const itensDaLoja = dados.itens.filter((i) => idsPedidos.has(Number(i.pedidoId)));
    const totalPorPedido = new Map<number, number>();
    for (const i of itensDaLoja) {
      totalPorPedido.set(Number(i.pedidoId), (totalPorPedido.get(Number(i.pedidoId)) ?? 0) + Number(i.subtotal));
    }

    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const pagos = dados.pedidos.filter((p) => !['novo', 'cancelado'].includes(p.status));
    const vendasMes = pagos
      .filter((p) => new Date(p.data) >= inicioMes)
      .reduce((s, p) => s + (totalPorPedido.get(p.id) ?? 0), 0);

    // Últimos 7 dias
    const semana = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(agora);
      d.setDate(agora.getDate() - (6 - idx));
      const chave = d.toDateString();
      const valor = pagos
        .filter((p) => new Date(p.data).toDateString() === chave)
        .reduce((s, p) => s + (totalPorPedido.get(p.id) ?? 0), 0);
      return { label: DIAS[d.getDay()], value: valor };
    });

    const maisVendidos = Object.values(
      itensDaLoja.reduce<Record<number, { produtoId: number; nome: string; qtd: number; receita: number }>>((acc, i) => {
        const pid = Number(i.produtoId);
        const nome = dados.produtos.find((p) => p.id === pid)?.nome ?? `Produto #${pid}`;
        acc[pid] = acc[pid] ?? { produtoId: pid, nome, qtd: 0, receita: 0 };
        acc[pid].qtd += Number(i.quantidade);
        acc[pid].receita += Number(i.subtotal);
        return acc;
      }, {}),
    ).sort((a, b) => b.qtd - a.qtd).slice(0, 3);

    const estoqueBaixo = dados.produtos
      .map((p) => ({ produto: p, estoque: estoqueDoProduto(p.id, dados.variacoes, dados.estoques) }))
      .filter((x) => x.estoque !== null && x.estoque <= 5);

    const hoje = agora.toDateString();
    return {
      vendasMes,
      pedidosTotal: dados.pedidos.length,
      pedidosHoje: dados.pedidos.filter((p) => new Date(p.data).toDateString() === hoje).length,
      produtosTotal: dados.produtos.length,
      destaques: dados.produtos.filter((p) => p.destaque).length,
      semana,
      maisVendidos,
      estoqueBaixo,
      totalPorPedido,
      recentes: [...dados.pedidos].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4),
    };
  }, [dados]);

  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const sessao = typeof window !== 'undefined' ? sessaoLojista.ler() : null;

  return (
    <MerchantLayout title="Dashboard">
      {carregando ? (
        <Loading />
      ) : erro ? (
        <ErrorState message={erro} onRetry={carregar} />
      ) : !metricas ? null : (
        <>
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Olá, {sessao?.usuario.nome.split(' ')[0]}! 👋</h2>
              <p className="text-sm text-slate-500">Aqui está o resumo de hoje, {hoje}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/painel/produtos/novo')}>
                <IconPlus className="w-4 h-4" /> Cadastrar produto
              </Button>
              <Button size="sm" onClick={() => router.push('/painel/pedidos')}>
                <IconClipboard className="w-4 h-4" /> Ver pedidos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Vendas do mês" value={fmt(metricas.vendasMes)} sub="Pedidos pagos" icon={<IconTrendingUp className="w-5 h-5" />} color="indigo" />
            <StatCard label="Pedidos" value={String(metricas.pedidosTotal)} sub={`${metricas.pedidosHoje} novos hoje`} icon={<IconClipboard className="w-5 h-5" />} color="green" />
            <StatCard label="Produtos" value={String(metricas.produtosTotal)} sub={`${metricas.destaques} em destaque`} icon={<IconPackage className="w-5 h-5" />} color="purple" />
            <StatCard label="Estoque baixo" value={String(metricas.estoqueBaixo.length)} sub="Reposição necessária" icon={<IconAlertTriangle className="w-5 h-5" />} color="amber" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Vendas da semana</h3>
                <Badge color="indigo">Últimos 7 dias</Badge>
              </div>
              <BarChart data={metricas.semana} />
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Total: {fmt(metricas.semana.reduce((s, d) => s + d.value, 0))}</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Mais vendidos</h3>
              {metricas.maisVendidos.length === 0 ? (
                <p className="text-xs text-slate-500">Ainda sem vendas registradas.</p>
              ) : (
                <div className="space-y-3">
                  {metricas.maisVendidos.map((p, i) => {
                    const img = imagemPrincipal(p.produtoId, dados!.imagens);
                    return (
                      <div key={p.produtoId} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {img ? <Img src={img} alt={p.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{p.nome}</p>
                          <p className="text-xs text-slate-500">{p.qtd} vendas</p>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{fmt(p.receita)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Pedidos recentes</h3>
                <Link href="/painel/pedidos" className="text-xs text-indigo-600 hover:underline">Ver todos</Link>
              </div>
              {metricas.recentes.length === 0 ? (
                <EmptyState icon={<IconClipboard className="w-8 h-8" />} title="Nenhum pedido ainda" description="Assim que sua loja receber pedidos, eles aparecem aqui." />
              ) : (
                <Table>
                  <Thead>
                    <tr><Th>Pedido</Th><Th>Cliente</Th><Th>Total</Th><Th>Status</Th></tr>
                  </Thead>
                  <tbody>
                    {metricas.recentes.map((o) => (
                      <Tr key={o.id} onClick={() => router.push(`/painel/pedidos/${o.id}`)}>
                        <Td><span className="font-medium text-indigo-600">#{o.id}</span></Td>
                        <Td>{o.cliente?.nome ?? '—'}</Td>
                        <Td><span className="font-semibold">{fmt(metricas.totalPorPedido.get(o.id) ?? 0)}</span></Td>
                        <Td><OrderStatusBadge status={o.status} /></Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconAlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900">Estoque baixo</h3>
              </div>
              {metricas.estoqueBaixo.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum produto com estoque baixo.</p>
              ) : (
                <div className="space-y-3">
                  {metricas.estoqueBaixo.slice(0, 5).map(({ produto, estoque }) => {
                    const img = imagemPrincipal(produto.id, dados!.imagens);
                    return (
                      <div key={produto.id} className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          {img ? <Img src={img} alt={produto.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{produto.nome}</p>
                          <p className="text-xs text-amber-600 font-medium">{estoque === 0 ? 'Esgotado' : `${estoque} restantes`}</p>
                        </div>
                        <Link href={`/painel/produtos/${produto.id}`} className="text-xs text-indigo-600 hover:underline">Editar</Link>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button variant="outline" fullWidth size="sm" className="mt-4" onClick={() => router.push('/painel/produtos')}>
                Gerenciar estoque
              </Button>
            </Card>
          </div>
        </>
      )}
    </MerchantLayout>
  );
}
