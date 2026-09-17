'use client';

// Navbar e rodapé da loja pública. A cor de destaque vem do rosa do protótipo;
// se quiser deixar configurável por loja, troque `bg-pink-500` por uma
// CSS variable alimentada por um campo novo na tabela Loja.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Img, IconSearch, IconShoppingCart, IconInstagram, IconWhatsApp } from './ui';
import { useCarrinho } from '@/src/context/CarrinhoContext';
import { useLoja } from '@/src/context/LojaContext';
import { sessaoCliente, type SessaoCliente } from '@/src/lib/session';
import { iniciais } from '@/src/lib/format';

export function StoreNav({ busca, onBusca }: { busca?: string; onBusca?: (v: string) => void }) {
  const loja = useLoja();
  const router = useRouter();
  const { totalItens } = useCarrinho();
  const [sessao, setSessao] = useState<SessaoCliente | null>(null);

  useEffect(() => {
    const ler = () => setSessao(sessaoCliente.ler(loja.slug));
    ler();
    window.addEventListener('allystore:sessao', ler);
    return () => window.removeEventListener('allystore:sessao', ler);
  }, [loja.slug]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
        <Link href={`/loja/${loja.slug}`} className="flex items-center gap-2 font-bold text-lg text-slate-900 flex-shrink-0">
          {loja.logo ? (
            <Img src={loja.logo} alt={loja.nome} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {iniciais(loja.nome)}
            </div>
          )}
          <span className="truncate max-w-[12rem]">{loja.nome}</span>
        </Link>

        <div className="flex-1 max-w-sm mx-auto hidden sm:block">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar produtos..."
              value={busca ?? ''}
              onChange={(e) => onBusca?.(e.target.value)}
              onFocus={() => { if (!onBusca) router.push(`/loja/${loja.slug}`); }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href={sessao ? `/loja/${loja.slug}/conta` : `/loja/${loja.slug}/entrar`}
            className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 hidden sm:block"
          >
            {sessao ? sessao.cliente.nome.split(' ')[0] : 'Entrar'}
          </Link>
          <Link
            href={`/loja/${loja.slug}/carrinho`}
            className="relative flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <IconShoppingCart className="w-4 h-4" />
            <span className="hidden sm:block">Carrinho</span>
            {totalItens > 0 && (
              <span className="w-5 h-5 bg-pink-500 rounded-full text-xs font-bold flex items-center justify-center">{totalItens}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function StoreFooter() {
  const loja = useLoja();
  const zap = loja.telefone?.replace(/\D/g, '');
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {loja.logo ? (
              <Img src={loja.logo} alt={loja.nome} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {iniciais(loja.nome)}
              </div>
            )}
            <span className="font-bold text-white">{loja.nome}</span>
          </div>
          {loja.descricao && <p className="text-sm text-slate-400">{loja.descricao}</p>}
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Contato</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>{loja.email}</li>
            {loja.telefone && <li>{loja.telefone}</li>}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Redes sociais</p>
          <div className="flex gap-3">
            <span className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors cursor-pointer">
              <IconInstagram className="w-4 h-4" />
            </span>
            {zap && (
              <a
                href={`https://wa.me/55${zap}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <IconWhatsApp className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Loja criada com <span className="text-indigo-400 font-medium">AllysTore</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
