'use client';

// Carrinho por loja, guardado no navegador. Ao finalizar a compra, os itens
// viram Pedido + ProdutoPedido no backend (veja app/loja/[slug]/checkout).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface ItemCarrinho {
  produtoId: number;
  variacaoId: number | null;
  nome: string;
  preco: number;
  imagem: string | null;
  quantidade: number;
  tamanho?: string | null;
  cor?: string | null;
  estoqueDisponivel?: number | null;
}

interface CarrinhoContexto {
  itens: ItemCarrinho[];
  totalItens: number;
  subtotal: number;
  adicionar: (item: ItemCarrinho) => void;
  definirQuantidade: (produtoId: number, variacaoId: number | null, quantidade: number) => void;
  remover: (produtoId: number, variacaoId: number | null) => void;
  limpar: () => void;
  pronto: boolean;
}

const Ctx = createContext<CarrinhoContexto | null>(null);

const chave = (slug: string) => `allystore:carrinho:${slug}`;
const mesmo = (a: ItemCarrinho, produtoId: number, variacaoId: number | null) =>
  a.produtoId === produtoId && (a.variacaoId ?? null) === (variacaoId ?? null);

export function CarrinhoProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(chave(slug));
      setItens(bruto ? (JSON.parse(bruto) as ItemCarrinho[]) : []);
    } catch {
      setItens([]);
    }
    setPronto(true);
  }, [slug]);

  useEffect(() => {
    if (!pronto) return;
    window.localStorage.setItem(chave(slug), JSON.stringify(itens));
  }, [itens, slug, pronto]);

  const adicionar = useCallback((item: ItemCarrinho) => {
    setItens((atuais) => {
      const existente = atuais.find((i) => mesmo(i, item.produtoId, item.variacaoId));
      if (!existente) return [...atuais, item];
      return atuais.map((i) =>
        mesmo(i, item.produtoId, item.variacaoId)
          ? { ...i, quantidade: i.quantidade + item.quantidade }
          : i,
      );
    });
  }, []);

  const definirQuantidade = useCallback((produtoId: number, variacaoId: number | null, quantidade: number) => {
    setItens((atuais) =>
      quantidade < 1
        ? atuais.filter((i) => !mesmo(i, produtoId, variacaoId))
        : atuais.map((i) => (mesmo(i, produtoId, variacaoId) ? { ...i, quantidade } : i)),
    );
  }, []);

  const remover = useCallback((produtoId: number, variacaoId: number | null) => {
    setItens((atuais) => atuais.filter((i) => !mesmo(i, produtoId, variacaoId)));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const valor = useMemo<CarrinhoContexto>(() => ({
    itens,
    totalItens: itens.reduce((s, i) => s + i.quantidade, 0),
    subtotal: itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
    adicionar, definirQuantidade, remover, limpar, pronto,
  }), [itens, adicionar, definirQuantidade, remover, limpar, pronto]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCarrinho precisa estar dentro de <CarrinhoProvider>');
  return ctx;
}
