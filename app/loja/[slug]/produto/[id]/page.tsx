'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { useCarrinho } from '@/src/context/CarrinhoContext';
import { StoreNav, StoreFooter } from '@/src/components/StoreChrome';
import {
  Badge, Button, Divider, Img, Placeholder, QuantitySelector, Tabs, Loading, ErrorState,
  IconChevronRight, IconShoppingCart, IconShield, IconTruck, IconCheck, useToast,
} from '@/src/components/ui';
import type { Estoque, Imagem, Produto, ProdutoVariacao } from '@/src/lib/types';

export default function ProdutoPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { id } = use(params);
  const loja = useLoja();
  const router = useRouter();
  const { adicionar } = useCarrinho();
  const { show, ToastEl } = useToast();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [variacoes, setVariacoes] = useState<ProdutoVariacao[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [relacionados, setRelacionados] = useState<Produto[]>([]);
  const [todasImagens, setTodasImagens] = useState<Imagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [variacaoId, setVariacaoId] = useState<number | null>(null);
  const [qtd, setQtd] = useState(1);
  const [aba, setAba] = useState('descricao');

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, is, vs, es, ps] = await Promise.all([
        api.produto.buscar(id),
        api.imagem.listar(),
        api.produtoVariacao.listar(),
        api.estoque.listar(),
        api.produto.listar(),
      ]);
      setProduto(p);
      setTodasImagens(is);
      setImagens(is.filter((i) => Number(i.produtoId) === Number(id)).sort((a, b) => a.ordem - b.ordem));
      const vsProduto = vs.filter((v) => Number(v.produtoId) === Number(id));
      setVariacoes(vsProduto);
      setVariacaoId(vsProduto[0]?.id ?? null);
      setEstoques(es);
      setRelacionados(
        ps.filter((x) => Number(x.lojaId) === loja.id && x.id !== Number(id) && x.status === 'ativo').slice(0, 3),
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const tamanhos = useMemo(() => [...new Set(variacoes.map((v) => v.tamanho))], [variacoes]);
  const cores = useMemo(() => [...new Set(variacoes.map((v) => v.cor))], [variacoes]);
  const variacao = variacoes.find((v) => v.id === variacaoId) ?? null;

  const estoqueDaVariacao = (vId: number | null) => {
    if (vId === null) return null;
    return estoques
      .filter((e) => Number(e.produtoVariacaoId) === vId)
      .reduce((s, e) => s + Number(e.quantidade ?? 0), 0);
  };

  const estoqueTotal = useMemo(() => {
    if (variacoes.length === 0) return null;
    const ids = variacoes.map((v) => v.id);
    return estoques.filter((e) => ids.includes(Number(e.produtoVariacaoId))).reduce((s, e) => s + Number(e.quantidade ?? 0), 0);
  }, [variacoes, estoques]);

  const estoqueAtual = variacao ? estoqueDaVariacao(variacao.id) : estoqueTotal;
  const semEstoque = estoqueAtual === 0;
  const preco = Number(variacao?.preco ?? produto?.preco ?? 0);

  const montarItem = () => ({
    produtoId: Number(id),
    variacaoId: variacao?.id ?? null,
    nome: produto!.nome,
    preco,
    imagem: imagens[0]?.url ?? null,
    quantidade: qtd,
    tamanho: variacao?.tamanho ?? null,
    cor: variacao?.cor ?? null,
    estoqueDisponivel: estoqueAtual,
  });

  const adicionarAoCarrinho = () => {
    adicionar(montarItem());
    show(`${qtd}x "${produto!.nome}" adicionado ao carrinho!`);
  };

  const comprarAgora = () => {
    adicionar(montarItem());
    router.push(`/loja/${loja.slug}/carrinho`);
  };

  if (carregando) return <div className="min-h-screen bg-white"><StoreNav /><Loading /></div>;
  if (erro || !produto) {
    return (
      <div className="min-h-screen bg-white">
        <StoreNav />
        <ErrorState message={erro ?? 'Produto não encontrado.'} onRetry={carregar} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {ToastEl}
      <StoreNav />

      <div className="max-w-6xl mx-auto px-6 py-4 w-full">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href={`/loja/${loja.slug}`} className="hover:text-slate-900">Loja</Link>
          <IconChevronRight className="w-3.5 h-3.5" />
          <span>{produto.categoria?.nome ?? 'Produtos'}</span>
          <IconChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">{produto.nome}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 w-full flex-1">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3">
              {imagens[imagemAtiva] ? (
                <Img src={imagens[imagemAtiva].url} alt={produto.nome} className="w-full h-full object-cover" />
              ) : (
                <Placeholder />
              )}
            </div>
            {imagens.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {imagens.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImagemAtiva(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${imagemAtiva === i ? 'border-indigo-500' : 'border-slate-200'}`}
                  >
                    <Img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Badge color={estoqueAtual === 0 ? 'red' : estoqueAtual !== null && estoqueAtual <= 5 ? 'yellow' : 'green'}>
              {estoqueAtual === 0
                ? 'Esgotado'
                : estoqueAtual !== null && estoqueAtual <= 5
                  ? `Apenas ${estoqueAtual} em estoque!`
                  : 'Em estoque'}
            </Badge>
            <h1 className="text-2xl font-bold text-slate-900 mt-3">{produto.nome}</h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">{fmt(preco)}</span>
            </div>
            <p className="text-sm text-indigo-600 font-medium mt-1">3x de {fmt(preco / 3)} sem juros no Pix</p>

            <Divider />

            {tamanhos.length > 1 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Tamanho: <span className="font-normal text-slate-500">{variacao?.tamanho}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {tamanhos.map((t) => {
                    const alvo = variacoes.find((v) => v.tamanho === t && (!variacao || v.cor === variacao.cor))
                      ?? variacoes.find((v) => v.tamanho === t)!;
                    const ativo = variacao?.tamanho === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setVariacaoId(alvo.id)}
                        className={`min-w-10 h-10 px-2 rounded-lg border text-sm font-medium transition-colors
                          ${ativo ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {cores.length > 1 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Cor: <span className="font-normal text-slate-500">{variacao?.cor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {cores.map((c) => {
                    const alvo = variacoes.find((v) => v.cor === c && (!variacao || v.tamanho === variacao.tamanho))
                      ?? variacoes.find((v) => v.cor === c)!;
                    const ativo = variacao?.cor === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setVariacaoId(alvo.id)}
                        className={`px-3 h-9 rounded-lg border text-sm font-medium transition-colors
                          ${ativo ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">Quantidade</p>
              <QuantitySelector value={qtd} onChange={setQtd} max={estoqueAtual ?? 99} />
            </div>

            {semEstoque ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-slate-700">Produto esgotado</p>
                <p className="text-xs text-slate-500 mt-1">Volte em breve ou fale com a loja.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button size="lg" fullWidth onClick={comprarAgora}>Comprar agora</Button>
                <Button variant="outline" size="lg" fullWidth onClick={adicionarAoCarrinho}>
                  <IconShoppingCart className="w-4 h-4" />
                  Adicionar ao carrinho
                </Button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {[
                { icon: <IconShield className="w-4 h-4 text-emerald-500" />, text: 'Compra 100% segura e protegida' },
                { icon: <IconTruck className="w-4 h-4 text-indigo-500" />, text: 'Envio combinado direto com a loja' },
                { icon: <IconCheck className="w-4 h-4 text-emerald-500" />, text: 'Troca conforme política da loja' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">{item.icon}{item.text}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Tabs
            tabs={[
              { id: 'descricao', label: 'Descrição' },
              { id: 'especificacoes', label: 'Especificações' },
            ]}
            active={aba}
            onChange={setAba}
          />
          <div className="py-6">
            {aba === 'descricao' && (
              <p className="text-slate-700 leading-relaxed max-w-2xl">{produto.descricao}</p>
            )}
            {aba === 'especificacoes' && (
              <table className="text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2.5 pr-8 text-slate-500 font-medium">Categoria</td><td className="py-2.5 text-slate-800">{produto.categoria?.nome ?? '—'}</td></tr>
                  {variacao && <tr><td className="py-2.5 pr-8 text-slate-500 font-medium">SKU</td><td className="py-2.5 text-slate-800">{variacao.sku}</td></tr>}
                  <tr><td className="py-2.5 pr-8 text-slate-500 font-medium">Variações</td><td className="py-2.5 text-slate-800">{variacoes.length || '—'}</td></tr>
                  <tr><td className="py-2.5 pr-8 text-slate-500 font-medium">Vendido por</td><td className="py-2.5 text-slate-800">{loja.nome}</td></tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {relacionados.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold text-lg text-slate-900 mb-5">Você também pode gostar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relacionados.map((p) => {
                const img = todasImagens.find((i) => Number(i.produtoId) === p.id)?.url ?? null;
                return (
                  <Link
                    key={p.id}
                    href={`/loja/${loja.slug}/produto/${p.id}`}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="aspect-square bg-slate-100">
                      {img ? <Img src={img} alt={p.nome} className="w-full h-full object-cover" /> : <Placeholder />}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-slate-800 truncate">{p.nome}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{fmt(p.preco)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
