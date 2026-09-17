'use client';

// Sessão simples guardada no navegador.
//
// ATENÇÃO: isso NÃO é autenticação segura — é o mínimo para as telas
// funcionarem enquanto o backend não tem JWT/cookie de sessão. Veja as
// observações no README antes de ir para produção.

import type { Cliente, Loja, Lojista, Usuario } from './types';

export interface SessaoLojista {
  usuario: Usuario;
  lojista: Lojista;
  loja: Loja;
}

export interface SessaoAdmin {
  usuario: Usuario;
}

export interface SessaoCliente {
  usuario: Usuario;
  cliente: Cliente;
}

const CHAVE_LOJISTA = 'allystore:sessao:lojista';
const CHAVE_ADMIN = 'allystore:sessao:admin';
const chaveCliente = (slug: string) => `allystore:sessao:cliente:${slug}`;

function ler<T>(chave: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(chave, JSON.stringify(valor));
  window.dispatchEvent(new Event('allystore:sessao'));
}

function limpar(chave: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(chave);
  window.dispatchEvent(new Event('allystore:sessao'));
}

export const sessaoLojista = {
  ler: () => ler<SessaoLojista>(CHAVE_LOJISTA),
  gravar: (s: SessaoLojista) => gravar(CHAVE_LOJISTA, s),
  sair: () => limpar(CHAVE_LOJISTA),
};

export const sessaoAdmin = {
  ler: () => ler<SessaoAdmin>(CHAVE_ADMIN),
  gravar: (s: SessaoAdmin) => gravar(CHAVE_ADMIN, s),
  sair: () => limpar(CHAVE_ADMIN),
};

export const sessaoCliente = {
  ler: (slug: string) => ler<SessaoCliente>(chaveCliente(slug)),
  gravar: (slug: string, s: SessaoCliente) => gravar(chaveCliente(slug), s),
  sair: (slug: string) => limpar(chaveCliente(slug)),
};
