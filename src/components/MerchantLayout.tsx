'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AllysToreLogo, Avatar, IconHome, IconPackage, IconShoppingBag, IconClipboard,
  IconStore, IconSettings, IconLogOut, IconBell, IconChevronRight, Loading,
} from './ui';
import { sessaoLojista, type SessaoLojista } from '@/src/lib/session';

const nav = [
  { href: '/painel', label: 'Dashboard', icon: <IconHome className="w-[18px] h-[18px]" /> },
  { href: '/painel/pedidos', label: 'Pedidos', icon: <IconClipboard className="w-[18px] h-[18px]" /> },
  { href: '/painel/produtos', label: 'Produtos', icon: <IconPackage className="w-[18px] h-[18px]" /> },
  { href: '/painel/loja', label: 'Loja', icon: <IconStore className="w-[18px] h-[18px]" /> },
  { href: '/painel/configuracoes', label: 'Configurações', icon: <IconSettings className="w-[18px] h-[18px]" /> },
];

export default function MerchantLayout({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sessao, setSessao] = useState<SessaoLojista | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const s = sessaoLojista.ler();
    if (!s) {
      router.replace('/painel/entrar');
      return;
    }
    setSessao(s);
    setVerificando(false);
  }, [router]);

  const sair = () => {
    sessaoLojista.sair();
    router.replace('/painel/entrar');
  };

  if (verificando || !sessao) {
    return <div className="min-h-screen bg-slate-50"><Loading label="Verificando acesso..." /></div>;
  }

  const ativo = (href: string) =>
    href === '/painel' ? pathname === '/painel' : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex-col hidden md:flex">
        <div className="px-5 py-5 border-b border-slate-100">
          <AllysToreLogo size="sm" />
        </div>

        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <div className="mb-4 px-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <IconShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{sessao.loja.nome}</p>
                <p className="text-xs text-indigo-600">
                  {sessao.loja.status === 'ativo' ? 'Loja ativa' : 'Loja inativa'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Menu</p>
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const active = ativo(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left
                    ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                  {active && <IconChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={sair}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <IconLogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="font-semibold text-slate-900">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 relative"
                aria-label="Notificações"
              >
                <IconBell className="w-[18px] h-[18px]" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-sm text-slate-900">Notificações</p>
                  </div>
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-500">Nenhuma notificação por enquanto.</p>
                  </div>
                </div>
              )}
            </div>
            <Link href={`/loja/${sessao.loja.slug}`} target="_blank" className="text-xs text-indigo-600 hover:underline hidden sm:block">
              Ver loja pública
            </Link>
            <div className="flex items-center gap-2">
              <Avatar name={sessao.usuario.nome} size="sm" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{sessao.usuario.nome}</p>
                <p className="text-xs text-slate-500 capitalize">{sessao.lojista.cargo || 'Lojista'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
