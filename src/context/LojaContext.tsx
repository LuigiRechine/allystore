'use client';

// Dados da loja pública atual (carregados no layout de /loja/[slug]).

import { createContext, useContext, type ReactNode } from 'react';
import type { Loja } from '@/src/lib/types';

const Ctx = createContext<Loja | null>(null);

export function LojaProvider({ loja, children }: { loja: Loja; children: ReactNode }) {
  return <Ctx.Provider value={loja}>{children}</Ctx.Provider>;
}

export function useLoja() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLoja precisa estar dentro de <LojaProvider>');
  return ctx;
}
