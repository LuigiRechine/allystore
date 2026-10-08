'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/src/components/AdminLayout';
import {
  Card, Table, Thead, Th, Td, Tr, Badge, Avatar, SearchInput, PageHeader,
  Modal, Button, EmptyState, Loading, ErrorState, StatCard, useToast,
  IconUser, IconStore, IconCheck, IconX,
} from '@/src/components/ui';
import { api, ApiError } from '@/src/lib/api';
import { dataCurta } from '@/src/lib/format';
import type { Lojista } from '@/src/lib/types';

type StatusFiltro = 'todos' | 'ativo' | 'inativo';

export default function AdminLojistasPage() {
  const [lojistas, setLojistas] = useState<Lojista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [selecionado, setSelecionado] = useState<Lojista | null>(null);
  const [confirmar, setConfirmar] = useState<{ lojista: Lojista; novoStatus: 'ativo' | 'inativo' } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const { show, ToastEl } = useToast();

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await api.lojista.listar();
      setLojistas(dados);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível carregar os lojistas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lojistas.filter((l) => {
      const nome = l.usuario?.nome ?? '';
      const email = l.usuario?.email ?? '';
      const loja = l.loja?.nome ?? '';
      const buscaOk =
        !termo ||
        nome.toLowerCase().includes(termo) ||
        email.toLowerCase().includes(termo) ||
        loja.toLowerCase().includes(termo);
      const statusOk = statusFiltro === 'todos' || l.usuario?.status === statusFiltro;
      return buscaOk && statusOk;
    });
  }, [lojistas, busca, statusFiltro]);

  const totalAtivos = lojistas.filter((l) => l.usuario?.status === 'ativo').length;
  const totalInativos = lojistas.filter((l) => l.usuario?.status === 'inativo').length;
  const totalLojas = new Set(lojistas.map((l) => l.lojaId)).size;

  async function confirmarAlteracaoStatus() {
    if (!confirmar) return;
    const { lojista, novoStatus } = confirmar;
    const u = lojista.usuario;
    if (!u) return;

    setSalvando(true);
    try {
      await api.usuario.atualizar(u.id, {
        nome: u.nome,
        email: u.email,
        senha: u.senha,
        telefone: u.telefone,
        tipo: u.tipo,
        status: novoStatus,
      });
      setLojistas((ls) =>
        ls.map((l) => (l.id === lojista.id ? { ...l, usuario: { ...l.usuario!, status: novoStatus } } : l)),
      );
      show(
        novoStatus === 'ativo' ? `Lojista "${u.nome}" reativado!` : `Lojista "${u.nome}" desativado.`,
        novoStatus === 'ativo' ? 'success' : 'info',
      );
      setConfirmar(null);
      setSelecionado(null);
    } catch (e) {
      show(e instanceof ApiError ? e.message : 'Não foi possível atualizar o status.', 'error');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AdminLayout title="Lojistas">
      {ToastEl}
      <PageHeader title="Lojistas da plataforma" description={`${lojistas.length} lojistas cadastrados`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total de lojistas" value={String(lojistas.length)} icon={<IconUser className="w-5 h-5" />} color="indigo" />
        <StatCard label="Ativos" value={String(totalAtivos)} icon={<IconCheck className="w-5 h-5" />} color="green" />
        <StatCard label="Inativos" value={String(totalInativos)} icon={<IconX className="w-5 h-5" />} color="red" />
        <StatCard label="Lojas vinculadas" value={String(totalLojas)} icon={<IconStore className="w-5 h-5" />} color="purple" />
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-48">
            <SearchInput placeholder="Buscar por nome, e-mail ou loja..." value={busca} onChange={setBusca} />
          </div>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        {carregando ? (
          <Loading label="Carregando lojistas..." />
        ) : erro ? (
          <ErrorState message={erro} onRetry={carregar} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={<IconUser className="w-7 h-7" />}
            title="Nenhum lojista encontrado"
            description="Ajuste a busca ou o filtro de status para ver outros resultados."
          />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Lojista</Th>
                <Th>Loja</Th>
                <Th>Cargo</Th>
                <Th>Status</Th>
                <Th>Vinculado em</Th>
                <Th>Ações</Th>
              </tr>
            </Thead>
            <tbody>
              {filtrados.map((lojista) => (
                <Tr key={lojista.id} onClick={() => setSelecionado(lojista)}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={lojista.usuario?.nome ?? '?'} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{lojista.usuario?.nome ?? '—'}</p>
                        <p className="text-xs text-slate-400">{lojista.usuario?.email ?? '—'}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <IconStore className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{lojista.loja?.nome ?? '—'}</span>
                    </div>
                  </Td>
                  <Td><span className="text-sm text-slate-600">{lojista.cargo}</span></Td>
                  <Td>
                    <Badge color={lojista.usuario?.status === 'ativo' ? 'green' : 'red'}>
                      {lojista.usuario?.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td><span className="text-slate-500 text-sm">{dataCurta(lojista.data_vinculo)}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-xs text-indigo-600 hover:underline px-2 py-1"
                        onClick={() => setSelecionado(lojista)}
                      >
                        Ver
                      </button>
                      {lojista.usuario?.status === 'ativo' ? (
                        <button
                          className="text-xs text-red-600 hover:underline px-2 py-1"
                          onClick={() => setConfirmar({ lojista, novoStatus: 'inativo' })}
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          className="text-xs text-emerald-600 hover:underline px-2 py-1"
                          onClick={() => setConfirmar({ lojista, novoStatus: 'ativo' })}
                        >
                          Ativar
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Detalhes do lojista */}
      <Modal open={!!selecionado} onClose={() => setSelecionado(null)} title="Detalhes do lojista">
        {selecionado && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selecionado.usuario?.nome ?? '?'} size="lg" />
              <div>
                <p className="font-semibold text-slate-900">{selecionado.usuario?.nome}</p>
                <p className="text-sm text-slate-500">{selecionado.usuario?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Telefone</p>
                <p className="text-slate-700">{selecionado.usuario?.telefone ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Cargo</p>
                <p className="text-slate-700">{selecionado.cargo}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Loja</p>
                <p className="text-slate-700">{selecionado.loja?.nome ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Vinculado em</p>
                <p className="text-slate-700">{dataCurta(selecionado.data_vinculo)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
              <Badge color={selecionado.usuario?.status === 'ativo' ? 'green' : 'red'}>
                {selecionado.usuario?.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="flex gap-3 pt-2">
              {selecionado.usuario?.status === 'ativo' ? (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setConfirmar({ lojista: selecionado, novoStatus: 'inativo' })}
                >
                  Desativar lojista
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => setConfirmar({ lojista: selecionado, novoStatus: 'ativo' })}
                >
                  Ativar lojista
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmação de ativar/desativar */}
      <Modal
        open={!!confirmar}
        onClose={() => !salvando && setConfirmar(null)}
        title={confirmar?.novoStatus === 'ativo' ? 'Ativar lojista' : 'Desativar lojista'}
      >
        {confirmar && (
          <>
            <div className="flex items-start gap-3 mb-5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  confirmar.novoStatus === 'ativo' ? 'bg-emerald-100' : 'bg-red-100'
                }`}
              >
                {confirmar.novoStatus === 'ativo' ? (
                  <IconCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <IconX className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {confirmar.novoStatus === 'ativo' ? 'Ativar' : 'Desativar'} "{confirmar.lojista.usuario?.nome}"?
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {confirmar.novoStatus === 'ativo'
                    ? 'O lojista voltará a ter acesso ao painel da loja.'
                    : 'O lojista perderá o acesso ao painel da loja até ser reativado. Os dados são preservados.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth disabled={salvando} onClick={() => setConfirmar(null)}>
                Cancelar
              </Button>
              <Button
                variant={confirmar.novoStatus === 'ativo' ? 'primary' : 'danger'}
                fullWidth
                disabled={salvando}
                onClick={confirmarAlteracaoStatus}
              >
                {salvando ? 'Salvando...' : 'Confirmar'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}
