'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, estoqueDoProduto, imagemPrincipal } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { useCarrinho } from '@/src/context/CarrinhoContext';
import { StoreNav, StoreFooter } from '@/src/components/StoreChrome';
import {
  Badge, Img, Placeholder, Loading, ErrorState, EmptyState, useToast, IconPackage,
} from '@/src/components/ui';
import type { Categoria, Estoque, Imagem, Produto, ProdutoVariacao } from '@/src/lib/types';

export default function VitrinePage() {
  const loja = useLoja();
  const router = useRouter();
  const { adicionar } = useCarrinho();
  const { show, ToastEl } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [variacoes, setVariacoes] = useState<ProdutoVariacao[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [ps, cs, is, vs, es] = await Promise.all([
        api.produto.listar(),
        api.categoria.listar(),
        api.imagem.listar(),
        api.produtoVariacao.listar(),
        api.estoque.listar(),
      ]);
      setProdutos(ps.filter((p) => Number(p.lojaId) === loja.id && p.status === 'ativo'));
      setCategorias(cs.filter((c) => Number(c.lojaId) === loja.id && c.status === 'ativo'));
      setImagens(is);
      setVariacoes(vs);
      setEstoques(es);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [loja.id]);

  const filtrados = useMemo(() => {
    return produtos.filter((p) => {
      const porCategoria =
        categoriaAtiva === 'Todos' || p.categoria?.nome === categoriaAtiva;
      const porBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
      return porCategoria && porBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  const destaque = produtos.find((p) => p.destaque) ?? produtos[0];

  const adicionarAoCarrinho = (p: Produto) => {
    const estoque = estoqueDoProduto(p.id, variacoes, estoques);
    if (estoque === 0) return;
    const variacao = variacoes.find((v) => Number(v.produtoId) === p.id) ?? null;
    adicionar({
      produtoId: p.id,
      variacaoId: variacao?.id ?? null,
      nome: p.nome,
      preco: Number(p.preco),
      imagem: imagemPrincipal(p.id, imagens),
      quantidade: 1,
      tamanho: variacao?.tamanho ?? null,
      cor: variacao?.cor ?? null,
      estoqueDisponivel: estoque,
    });
    show(`"${p.nome}" adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {ToastEl}
      <StoreNav busca={busca} onBusca={setBusca} />

      {/* Hero */}
      <div className="relative h-80 overflow-hidden bg-slate-900">
        {destaque && imagemPrincipal(destaque.id, imagens) ? (
          <Img src={imagemPrincipal(destaque.id, imagens)!} alt={loja.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <p className="text-pink-300 text-sm font-medium mb-2 uppercase tracking-widest">Bem-vinda à</p>
            <h1 className="text-4xl font-bold text-white mb-3">{loja.nome}</h1>
            {loja.descricao && <p className="text-slate-300 mb-6 max-w-sm">{loja.descricao}</p>}
            {destaque && (
              <Link
                href={`/loja/${loja.slug}/produto/${destaque.id}`}
                className="inline-block bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors text-sm"
              >
                Ver destaque
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categorias */}
      {categorias.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-6 w-full">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Todos', ...categorias.map((c) => c.nome)].map((c) => (
              <button
                key={c}
                onClick={() => setCategoriaAtiva(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-colors border
                  ${categoriaAtiva === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Produtos */}
      <div className="max-w-6xl mx-auto px-6 pb-16 w-full flex-1">
        <h2 className="font-bold text-xl text-slate-900 mb-6">
          {categoriaAtiva === 'Todos' ? 'Produtos em destaque' : categoriaAtiva}
        </h2>

        {carregando ? (
          <Loading label="Carregando produtos..." />
        ) : erro ? (
          <ErrorState message={erro} onRetry={carregar} />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={<IconPackage className="w-8 h-8" />}
            title="Nenhum produto por aqui"
            description="Esta loja ainda não publicou produtos nesta categoria."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtrados.map((produto) => {
              const img = imagemPrincipal(produto.id, imagens);
              const estoque = estoqueDoProduto(produto.id, variacoes, estoques);
              const semEstoque = estoque === 0;
              return (
                <div key={produto.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div
                    className="aspect-square overflow-hidden cursor-pointer bg-slate-100"
                    onClick={() => router.push(`/loja/${loja.slug}/produto/${produto.id}`)}
                  >
                    {img ? (
                      <Img src={img} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Placeholder />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    {semEstoque && <Badge color="red">Esgotado</Badge>}
                    {estoque !== null && estoque > 0 && estoque <= 5 && <Badge color="yellow">Últimas unidades</Badge>}
                    <Link
                      href={`/loja/${loja.slug}/produto/${produto.id}`}
                      className="font-semibold text-sm text-slate-900 mt-2 hover:text-indigo-600 transition-colors"
                    >
                      {produto.nome}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-slate-900">{fmt(produto.preco)}</span>
                    </div>
                    <p className="text-xs text-slate-500">3x de {fmt(Number(produto.preco) / 3)} sem juros</p>
                    <button
                      onClick={() => adicionarAoCarrinho(produto)}
                      disabled={semEstoque}
                      className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition-colors
                        ${semEstoque ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {semEstoque ? 'Esgotado' : 'Comprar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
