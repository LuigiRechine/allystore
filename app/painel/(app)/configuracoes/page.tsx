'use client';

import { useEffect, useState } from 'react';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api } from '@/src/lib/api';
import { alterarSenha as alterarSenhaApi, mercadoPago, type StatusMercadoPago } from '@/src/lib/api';
import { sessaoLojista, type SessaoLojista } from '@/src/lib/session';
import { Avatar, Badge, Button, Card, Input, PageHeader, Loading, useToast } from '@/src/components/ui';

const ABAS = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'notificacoes', label: 'Notificações' },
];

export default function ConfiguracoesPage() {
  const { show, ToastEl } = useToast();
  const [sessao, setSessao] = useState<SessaoLojista | null>(null);
  const [aba, setAba] = useState('perfil');
  const [salvando, setSalvando] = useState(false);
  const [perfil, setPerfil] = useState({ nome: '', email: '', telefone: '' });
  const [senhas, setSenhas] = useState({ atual: '', nova: '', confirmar: '' });
  const [mp, setMp] = useState<StatusMercadoPago | null>(null);

  // Volta do Mercado Pago: /painel/configuracoes?aba=pagamentos&mp=conectado|erro
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('aba') === 'pagamentos') setAba('pagamentos');
    const r = q.get('mp');
    if (r === 'conectado') show('Mercado Pago conectado! Sua loja já pode vender.');
    if (r === 'erro') show('Não foi possível conectar o Mercado Pago. Tente novamente.', 'error');
    mercadoPago.status().then(setMp).catch(() => setMp({ conectado: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const desconectarMp = async () => {
    if (!window.confirm('Desconectar o Mercado Pago? A loja deixa de receber pagamentos até você conectar de novo.')) return;
    try {
      setMp(await mercadoPago.desconectar());
      show('Mercado Pago desconectado.', 'info');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao desconectar.', 'error');
    }
  };

  useEffect(() => {
    const s = sessaoLojista.ler();
    if (!s) return;
    setSessao(s);
    setPerfil({ nome: s.usuario.nome, email: s.usuario.email, telefone: s.usuario.telefone ?? '' });
  }, []);

  const salvarPerfil = async () => {
    if (!sessao) return;
    setSalvando(true);
    try {
      const atualizado = await api.usuario.atualizar(sessao.usuario.id, {
        nome: perfil.nome,
        email: perfil.email,
        senha: sessao.usuario.senha,
        telefone: perfil.telefone,
        tipo: sessao.usuario.tipo,
        status: sessao.usuario.status,
      });
      const nova = { ...sessao, usuario: { ...sessao.usuario, ...atualizado } };
      sessaoLojista.gravar(nova);
      setSessao(nova);
      show('Perfil atualizado!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao salvar.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const alterarSenha = async () => {
    if (!sessao) return;
    if (senhas.nova.length < 8) { show('A nova senha precisa ter ao menos 8 caracteres.', 'error'); return; }
    if (senhas.nova !== senhas.confirmar) { show('As senhas não conferem.', 'error'); return; }
    setSalvando(true);
    try {
      
      await alterarSenhaApi(senhas.atual, senhas.nova);
      setSenhas({ atual: '', nova: '', confirmar: '' });
      show('Senha atualizada!');

    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao alterar a senha.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (!sessao) return <MerchantLayout title="Configurações"><Loading /></MerchantLayout>;

  return (
    <MerchantLayout title="Configurações">
      {ToastEl}
      <PageHeader title="Configurações" description="Gerencie sua conta e preferências" />

      <div className="flex gap-6 flex-col sm:flex-row">
        <div className="sm:w-48 flex-shrink-0">
          <nav className="flex sm:flex-col gap-0.5 overflow-x-auto">
            {ABAS.map((t) => (
              <button
                key={t.id}
                onClick={() => setAba(t.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${aba === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {aba === 'perfil' && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-5">Dados do perfil</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name={perfil.nome || sessao.usuario.nome} size="lg" />
                <div>
                  <p className="font-medium text-slate-900">{sessao.usuario.nome}</p>
                  <p className="text-xs text-slate-500 capitalize">{sessao.lojista.cargo}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Nome completo" value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
                <Input label="E-mail" type="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} />
                <Input label="Telefone" value={perfil.telefone} onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })} />
              </div>
              <Button className="mt-4" onClick={salvarPerfil} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </Card>
          )}

          {aba === 'pagamentos' && (
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="font-semibold text-slate-900">Mercado Pago</h2>
                {mp && <Badge color={mp.conectado ? 'green' : 'yellow'}>{mp.conectado ? 'Conectado' : 'Não conectado'}</Badge>}
              </div>
              <p className="text-sm text-slate-600 mb-5">
                Conecte a conta do Mercado Pago da sua loja. Os pagamentos dos seus clientes (Pix e cartão) caem direto na sua conta.
              </p>
              {!mp && <Loading />}
              {mp && !mp.conectado && (
                <Button onClick={() => { window.location.href = '/api/mercadopago/oauth/connect'; }}>
                  Conectar Mercado Pago
                </Button>
              )}
              {mp?.conectado && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Conta Mercado Pago: <span className="font-medium text-slate-800">{mp.mpUserId}</span></p>
                    <p>Modo: <span className="font-medium text-slate-800">{mp.liveMode ? 'Produção' : 'Teste'}</span></p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => { window.location.href = '/api/mercadopago/oauth/connect'; }}>Reconectar</Button>
                    <Button variant="danger" onClick={desconectarMp}>Desconectar</Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {aba === 'seguranca' && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-5">Segurança</h2>
              <div className="space-y-4 max-w-sm">
                <Input label="Senha atual" type="password" placeholder="••••••••" value={senhas.atual} onChange={(e) => setSenhas({ ...senhas, atual: e.target.value })} />
                <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" value={senhas.nova} onChange={(e) => setSenhas({ ...senhas, nova: e.target.value })} />
                <Input label="Confirmar nova senha" type="password" placeholder="••••••••" value={senhas.confirmar} onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })} />
              </div>
              
              <Button className="mt-4" onClick={alterarSenha} disabled={salvando}>Alterar senha</Button>
            </Card>
          )}

          {aba === 'notificacoes' && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-5">Notificações</h2>
              <div className="space-y-4">
                {[
                  { label: 'Novos pedidos', desc: 'Notificar quando receber um novo pedido' },
                  { label: 'Estoque baixo', desc: 'Alertar quando produto estiver com estoque baixo' },
                  { label: 'Pagamentos', desc: 'Notificar sobre aprovações e recusas de pagamento' },
                  { label: 'Resumo semanal', desc: 'Receber relatório de vendas toda segunda-feira' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{n.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                As preferências ainda não são persistidas — falta uma tabela de preferências no schema.
              </p>
            </Card>
          )}
        </div>
      </div>
    </MerchantLayout>
  );
}
