'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/src/components/AdminLayout';
import { api } from '@/src/lib/api';
import { dataCurta, fmt } from '@/src/lib/format';
import {
  Avatar, Badge, Button, Card, Modal, SearchInput, PageHeader,
  Table, Thead, Th, Td, Tr, Loading, ErrorState, useToast, IconCheck, IconX,
} from '@/src/components/ui';
import type { Loja, Lojista, Pedido, ProdutoPedido } from '@/src/lib/types';

export default function AdminLojasPage() {
  const { show, ToastEl } = useToast();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojistas, setLojistas] = useState<Lojista[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [desativar, setDesativar] = useState<Loja | null>(null);
  const [ativar, setAtivar] = useState<Loja | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [ls, ljs, ps, pps] = await Promise.all([
        api.loja.listar(), api.lojista.listar(), api.pedido.listar(), api.produtoPedido.listar(),
      ]);
      setLojas(ls); setLojistas(ljs); setPedidos(ps); setItens(pps);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar lojas.');
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
    const receita = new Map<number, number>();
    const qtd = new Map<number, number>();
    for (const p of pedidos) {
      const lid = Number(p.lojaId);
      qtd.set(lid, (qtd.get(lid) ?? 0) + 1);
      if (!['novo', 'cancelado'].includes(p.status)) {
        receita.set(lid, (receita.get(lid) ?? 0) + (totalPorPedido.get(p.id) ?? 0));
      }
    }
    return { receita, qtd };
  }, [pedidos, itens]);

  const donoDaLoja = (lojaId: number) =>
    lojistas.find((l) => Number(l.lojaId) === lojaId)?.usuario?.nome ?? '—';

  const filtradas = useMemo(() => lojas.filter((l) => {
    const alvo = `${l.nome} ${l.slug} ${donoDaLoja(l.id)}`.toLowerCase();
    return alvo.includes(busca.toLowerCase()) && (filtro === 'todos' || l.status === filtro);
  }), [lojas, busca, filtro, lojistas]);

  const mudarStatus = async (loja: Loja, status: string) => {
    setSalvando(true);
    try {
      await api.loja.atualizar(loja.id, {
        nome: loja.nome, slug: loja.slug, email: loja.email, status,
        logo: loja.logo, descricao: loja.descricao, telefone: loja.telefone,
      });
      setLojas((ls) => ls.map((l) => (l.id === loja.id ? { ...l, status } : l)));
      show(status === 'ativo' ? `Loja "${loja.nome}" ativada!` : `Loja "${loja.nome}" desativada.`, status === 'ativo' ? 'success' : 'info');
      setDesativar(null);
      setAtivar(null);
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao atualizar a loja.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const contagem = {
    ativas: lojas.filter((l) => l.status === 'ativo').length,
    inativas: lojas.filter((l) => l.status === 'inativo').length,
    pendentes: lojas.filter((l) => l.status === 'pendente').length,
  };

  return (
    <AdminLayout title="Gestão de Lojas">
      {ToastEl}
      <PageHeader title="Lojas da plataforma" description={`${lojas.length} lojas cadastradas`} />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Ativas', value: contagem.ativas, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Inativas', value: contagem.inativas, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Pendentes', value: contagem.pendentes, color: 'text-amber-700 bg-amber-50 border-amber-200' },
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
            <SearchInput placeholder="Buscar loja ou lojista..." value={busca} onChange={setBusca} />
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativas</option>
            <option value="inativo">Inativas</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>

        {carregando ? <Loading /> : erro ? <ErrorState message={erro} onRetry={carregar} /> : (
          <Table>
            <Thead>
              <tr><Th>Loja</Th><Th>Lojista</Th><Th>Status</Th><Th>Criada em</Th><Th>Pedidos</Th><Th>Receita</Th><Th>Ações</Th></tr>
            </Thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-500 text-sm">Nenhuma loja encontrada</td></tr>
              ) : filtradas.map((loja) => (
                <Tr key={loja.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {loja.nome[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{loja.nome}</p>
                        <p className="text-xs text-slate-400">/{loja.slug}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={donoDaLoja(loja.id)} size="sm" />
                      <span className="text-sm">{donoDaLoja(loja.id)}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge color={loja.status === 'ativo' ? 'green' : loja.status === 'pendente' ? 'yellow' : 'red'}>
                      {loja.status === 'ativo' ? 'Ativa' : loja.status === 'pendente' ? 'Pendente' : 'Inativa'}
                    </Badge>
                  </Td>
                  <Td><span className="text-slate-500 text-sm">{dataCurta(loja.dataCriacao)}</span></Td>
                  <Td><span className="font-medium">{metricas.qtd.get(loja.id) ?? 0}</span></Td>
                  <Td><span className="font-semibold text-slate-900">{fmt(metricas.receita.get(loja.id) ?? 0)}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/loja/${loja.slug}`} target="_blank" className="text-xs text-indigo-600 hover:underline px-2 py-1">Ver</Link>
                      {loja.status === 'ativo' ? (
                        <button onClick={() => setDesativar(loja)} className="text-xs text-red-600 hover:underline px-2 py-1">Desativar</button>
                      ) : (
                        <button onClick={() => setAtivar(loja)} className="text-xs text-emerald-600 hover:underline px-2 py-1">Ativar</button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!desativar} onClose={() => setDesativar(null)} title="Desativar loja">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Desativar &quot;{desativar?.nome}&quot;?</p>
            <p className="text-sm text-slate-600 mt-1">
              A loja fica inacessível para clientes. Os dados e produtos são preservados e ela pode ser reativada a qualquer momento.
            </p>
          </div>
        </div>
        {desativar && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
            <p className="text-xs text-amber-800 font-medium">
              ⚠️ Esta ação afeta {metricas.qtd.get(desativar.id) ?? 0} pedidos desta loja.
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDesativar(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth disabled={salvando} onClick={() => desativar && mudarStatus(desativar, 'inativo')}>
            {salvando ? 'Salvando...' : 'Confirmar desativação'}
          </Button>
        </div>
      </Modal>

      <Modal open={!!ativar} onClose={() => setAtivar(null)} title="Ativar loja">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Ativar &quot;{ativar?.nome}&quot;?</p>
            <p className="text-sm text-slate-600 mt-1">A loja voltará a ser acessível ao público.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setAtivar(null)}>Cancelar</Button>
          <Button fullWidth disabled={salvando} onClick={() => ativar && mudarStatus(ativar, 'ativo')}>
            {salvando ? 'Salvando...' : 'Ativar loja'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
