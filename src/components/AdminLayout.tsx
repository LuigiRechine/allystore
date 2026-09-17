'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconHome, IconStore, IconGrid, IconSettings, IconLogOut, IconUser, Loading } from './ui';
import { sessaoAdmin, type SessaoAdmin } from '@/src/lib/session';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: <IconHome className="w-4 h-4" /> },
  { href: '/admin/lojas', label: 'Lojas', icon: <IconStore className="w-4 h-4" /> },
  { href: '/admin/lojistas', label: 'Lojistas', icon: <IconUser className="w-4 h-4" /> },
  { href: '/admin/configuracoes', label: 'Configurações', icon: <IconSettings className="w-4 h-4" /> },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessao, setSessao] = useState<SessaoAdmin | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const s = sessaoAdmin.ler();
    if (!s) {
      router.replace('/admin/entrar');
      return;
    }
    setSessao(s);
    setVerificando(false);
  }, [router]);

  const sair = () => {
    sessaoAdmin.sair();
    router.replace('/admin/entrar');
  };

  if (verificando || !sessao) {
    return <div className="min-h-screen bg-slate-950"><Loading label="Verificando acesso..." /></div>;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
              <IconGrid className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Allys<span className="text-indigo-400">Tore</span>
              <span className="ml-1.5 text-[10px] font-medium bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">Admin</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left
                  ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {(sessao.usuario.nome || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{sessao.usuario.nome}</p>
              <p className="text-[10px] text-slate-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={sair}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors w-full"
          >
            <IconLogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-semibold text-slate-900">{title}</h1>
          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Painel Administrativo</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
