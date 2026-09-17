'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, login } from '@/src/lib/api';
import { sessaoAdmin } from '@/src/lib/session';
import { IconGrid } from '@/src/components/ui';

export default function AdminEntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const entrar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const usuario = await login(email, senha);
      const admins = await api.administrador.listar();
      const ehAdmin = admins.some((a) => Number(a.usuarioId) === Number(usuario.id));
      if (!ehAdmin && usuario.tipo !== 'admin') {
        throw new Error('Esta conta não tem acesso administrativo.');
      }
      sessaoAdmin.gravar({ usuario });
      router.replace('/admin');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <IconGrid className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">
              Allys<span className="text-indigo-400">Tore</span>
              <span className="ml-2 text-xs font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Admin</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-slate-400 mt-1 text-sm">Acesso restrito a administradores</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@allystore.com.br"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') entrar(); }}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 text-sm"
              />
            </div>
          </div>

          {erro && <p className="text-xs text-red-400 mb-4">{erro}</p>}

          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {carregando ? 'Autenticando...' : 'Entrar no painel'}
          </button>

          <div className="flex items-center gap-2 justify-center mt-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">Conexão segura</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center mt-6">AllysTore • Painel da plataforma</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/painel/entrar" className="text-xs text-slate-600 hover:text-slate-400">Ir para lojistas</Link>
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400">Início</Link>
        </div>
      </div>
    </div>
  );
}
