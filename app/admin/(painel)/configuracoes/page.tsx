'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/AdminLayout';
import {
  Card, Input, Button, PageHeader, Avatar, Badge, useToast, Loading,
  IconShield,
} from '@/src/components/ui';
import { api, ApiError } from '@/src/lib/api';
import { alterarSenha as alterarSenhaApi } from '@/src/lib/api';
import { sessaoAdmin } from '@/src/lib/session';
import type { Administrador, Usuario } from '@/src/lib/types';

type Aba = 'perfil' | 'seguranca';

export default function AdminConfiguracoesPage() {
  const [aba, setAba] = useState<Aba>('perfil');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [administrador, setAdministrador] = useState<Administrador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { show, ToastEl } = useToast();

  // Formulário de perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Formulário de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    const sessao = sessaoAdmin.ler();
    if (!sessao) {
      setCarregando(false);
      return;
    }
    setUsuario(sessao.usuario);
    setNome(sessao.usuario.nome);
    setEmail(sessao.usuario.email);
    setTelefone(sessao.usuario.telefone ?? '');

    api.administrador
      .listar()
      .then((admins) => {
        const meu = admins.find((a) => Number(a.usuarioId) === Number(sessao.usuario.id));
        if (meu) setAdministrador(meu);
      })
      .catch(() => {
        // Nível de acesso é apenas informativo; segue sem bloquear a tela.
      })
      .finally(() => setCarregando(false));
  }, []);

  async function salvarPerfil() {
    if (!usuario) return;
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      show('Preencha nome, e-mail e telefone.', 'error');
      return;
    }
    setSalvandoPerfil(true);
    try {
      await api.usuario.atualizar(usuario.id, {
        nome: nome.trim(),
        email: email.trim(),
        senha: usuario.senha,
        telefone: telefone.trim(),
        tipo: usuario.tipo,
        status: usuario.status,
      });
      const atualizado = { ...usuario, nome: nome.trim(), email: email.trim(), telefone: telefone.trim() };
      setUsuario(atualizado);
      const sessao = sessaoAdmin.ler();
      if (sessao) sessaoAdmin.gravar({ ...sessao, usuario: atualizado });
      show('Perfil atualizado!', 'success');
    } catch (e) {
      show(e instanceof ApiError ? e.message : 'Não foi possível salvar o perfil.', 'error');
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function alterarSenha() {
    if (!usuario) return;
    
    if (senhaNova.length < 8) {
      show('A nova senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }
    if (senhaNova !== senhaConfirma) {
      show('A confirmação não corresponde à nova senha.', 'error');
      return;
    }
    setSalvandoSenha(true);
    try {
      
      await alterarSenhaApi(senhaAtual, senhaNova);

      setSenhaAtual('');
      setSenhaNova('');
      setSenhaConfirma('');
      show('Senha atualizada!', 'success');
    } catch (e) {
      show(e instanceof ApiError ? e.message : 'Não foi possível alterar a senha.', 'error');
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (carregando) {
    return (
      <AdminLayout title="Configurações">
        <Loading label="Carregando configurações..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      {ToastEl}
      <PageHeader title="Configurações" description="Gerencie sua conta de administrador" />

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {[
              { id: 'perfil' as const, label: 'Perfil' },
              { id: 'seguranca' as const, label: 'Segurança' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setAba(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
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
                <Avatar name={nome || 'Admin'} size="lg" />
                <div>
                  <p className="font-medium text-slate-900">{nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <IconShield className="w-3.5 h-3.5 text-slate-400" />
                    <Badge color="indigo">{administrador?.nivelAcesso ?? 'Administrador'}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
                <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
              <Button className="mt-4" disabled={salvandoPerfil} onClick={salvarPerfil}>
                {salvandoPerfil ? 'Salvando...' : 'Salvar'}
              </Button>
            </Card>
          )}

          {aba === 'seguranca' && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-900 mb-5">Segurança</h2>
              <div className="space-y-4 max-w-sm">
                <Input
                  label="Senha atual"
                  type="password"
                  placeholder="••••••••"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
                <Input
                  label="Nova senha"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  placeholder="••••••••"
                  value={senhaConfirma}
                  onChange={(e) => setSenhaConfirma(e.target.value)}
                />
              </div>
              <Button className="mt-4" disabled={salvandoSenha} onClick={alterarSenha}>
                {salvandoSenha ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
