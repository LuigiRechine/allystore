'use client';

// Formulário de produto usado em /painel/produtos/novo e /painel/produtos/[id].
//
// Ao criar um produto, opcionalmente criamos também uma ProdutoVariacao
// "padrão" + Estoque, porque o controle de estoque no schema vive na variação,
// não no produto. Assim o lojista consegue cadastrar algo simples sem precisar
// entender variações.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { slugify } from '@/src/lib/format';
import { sessaoLojista } from '@/src/lib/session';
import {
  Button, Card, Divider, Img, Input, Placeholder, Select, Textarea, Loading, ErrorState,
  IconCheck, IconPlus, IconTrash, useToast,
} from './ui';
import { fmt } from '@/src/lib/format';
import type { Categoria, Estoque, Imagem, Produto, ProdutoVariacao } from '@/src/lib/types';

export default function ProdutoForm({ produtoId }: { produtoId?: string }) {
  const router = useRouter();
  const { show, ToastEl } = useToast();
  const editando = Boolean(produtoId);

  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [variacao, setVariacao] = useState<ProdutoVariacao | null>(null);
  const [estoque, setEstoque] = useState<Estoque | null>(null);
  const [novaImagem, setNovaImagem] = useState('');

  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '', status: 'ativo',
    categoriaId: '', destaque: false, sku: '', quantidade: '',
  });

  const set = (campo: keyof typeof form, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  useEffect(() => {
    (async () => {
      const sessao = sessaoLojista.ler();
      if (!sessao) return;
      setCarregando(true);
      setErroCarga(null);
      try {
        const cats = (await api.categoria.listar()).filter((c) => Number(c.lojaId) === sessao.loja.id);
        setCategorias(cats);

        if (produtoId) {
          const [p, imgs, vars, ests] = await Promise.all([
            api.produto.buscar(produtoId), api.imagem.listar(),
            api.produtoVariacao.listar(), api.estoque.listar(),
          ]);
          const v = vars.find((x) => Number(x.produtoId) === Number(produtoId)) ?? null;
          const e = v ? ests.find((x) => Number(x.produtoVariacaoId) === v.id) ?? null : null;
          setVariacao(v);
          setEstoque(e);
          setImagens(imgs.filter((i) => Number(i.produtoId) === Number(produtoId)).sort((a, b) => a.ordem - b.ordem));
          setForm({
            nome: p.nome,
            descricao: p.descricao ?? '',
            preco: String(p.preco),
            status: p.status,
            categoriaId: String(p.categoriaId),
            destaque: Boolean(p.destaque),
            sku: v?.sku ?? '',
            quantidade: e ? String(e.quantidade) : '',
          });
        } else {
          setForm((f) => ({ ...f, categoriaId: cats[0] ? String(cats[0].id) : '' }));
        }
      } catch (e) {
        setErroCarga(e instanceof Error ? e.message : 'Erro ao carregar o formulário.');
      } finally {
        setCarregando(false);
      }
    })();
  }, [produtoId]);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nome) e.nome = 'Nome é obrigatório';
    if (!form.descricao) e.descricao = 'Descrição é obrigatória';
    if (!form.preco || Number(form.preco) <= 0) e.preco = 'Informe um preço válido';
    if (!form.categoriaId) e.categoriaId = 'Escolha uma categoria';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = async () => {
    const sessao = sessaoLojista.ler();
    if (!sessao || !validar()) return;
    setSalvando(true);
    try {
      const corpo = {
        nome: form.nome,
        descricao: form.descricao,
        preco: Number(form.preco),
        status: form.status,
        categoriaId: Number(form.categoriaId),
        lojaId: sessao.loja.id,
        destaque: form.destaque,
      };

      const produto: Produto = editando
        ? await api.produto.atualizar(produtoId!, corpo)
        : await api.produto.criar(corpo);

      // Variação padrão + estoque
      const querEstoque = form.quantidade !== '' || form.sku !== '';
      if (querEstoque) {
        const sku = form.sku || `${slugify(form.nome).toUpperCase().slice(0, 10)}-${produto.id}`;
        const corpoVariacao = {
          sku,
          cor: variacao?.cor ?? 'Padrão',
          tamanho: variacao?.tamanho ?? 'Único',
          preco: Number(form.preco),
          status: form.status,
          produtoId: produto.id,
        };

        const v = variacao
          ? await api.produtoVariacao.atualizar(variacao.id, corpoVariacao)
          : await api.produtoVariacao.criar(corpoVariacao);

        const qtd = Number(form.quantidade || 0);
        if (estoque) {
          await api.estoque.atualizar(estoque.id, {
            produtoVariacaoId: v.id,
            quantidade: qtd,
            quantidade_reservada: estoque.quantidade_reservada,
            estoque_minimo: estoque.estoque_minimo,
          });
        } else {
          await api.estoque.criar({
            produtoVariacaoId: v.id,
            quantidade: qtd,
            quantidade_reservada: 0,
            estoque_minimo: 5,
          });
        }
      }

      // Imagens novas (só nas criações, as de edição já são salvas na hora)
      if (!editando) {
        for (const [i, img] of imagens.entries()) {
          await api.imagem.criar({ url: img.url, tipo: 'principal', produtoId: produto.id, ordem: i });
        }
      }

      show(editando ? 'Produto atualizado!' : 'Produto criado!');
      setTimeout(() => router.push('/painel/produtos'), 700);
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao salvar o produto.', 'error');
      setSalvando(false);
    }
  };

  const adicionarImagem = async () => {
    if (!novaImagem.trim()) return;
    if (editando) {
      try {
        const criada = await api.imagem.criar({
          url: novaImagem.trim(), tipo: 'principal', produtoId: Number(produtoId), ordem: imagens.length,
        });
        setImagens((is) => [...is, criada]);
      } catch (e) {
        show(e instanceof Error ? e.message : 'Falha ao adicionar imagem.', 'error');
        return;
      }
    } else {
      setImagens((is) => [...is, { id: -Date.now(), url: novaImagem.trim(), ordem: is.length, tipo: 'principal', produtoId: 0 }]);
    }
    setNovaImagem('');
  };

  const removerImagem = async (img: Imagem) => {
    if (img.id > 0) {
      try { await api.imagem.excluir(img.id); } catch { /* segue removendo da tela */ }
    }
    setImagens((is) => is.filter((i) => i.id !== img.id));
  };

  const precoPreview = useMemo(() => (form.preco ? fmt(Number(form.preco)) : fmt(0)), [form.preco]);

  if (carregando) return <Loading />;
  if (erroCarga) return <ErrorState message={erroCarga} />;

  return (
    <>
      {ToastEl}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.push('/painel/produtos')} className="text-slate-500 hover:text-slate-700 text-sm">
          ← Produtos
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-900 font-medium">{editando ? 'Editar' : 'Novo produto'}</span>
      </div>

      {categorias.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
          Você ainda não tem categorias. Crie uma em <strong>Painel → Loja → Categorias</strong> antes de cadastrar produtos.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Informações básicas</h2>
            <div className="space-y-4">
              <Input label="Nome do produto *" placeholder="Ex: Camiseta Premium" value={form.nome} onChange={(e) => set('nome', e.target.value)} error={erros.nome} />
              <Textarea label="Descrição *" placeholder="Descreva o produto em detalhes..." rows={4} value={form.descricao} onChange={(e) => set('descricao', e.target.value)} error={erros.descricao} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Preço (R$) *" type="number" step="0.01" placeholder="0.00" value={form.preco} onChange={(e) => set('preco', e.target.value)} error={erros.preco} />
                <Select label="Categoria *" value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)}>
                  <option value="">Selecione...</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </div>
              {erros.categoriaId && <p className="text-xs text-red-600">{erros.categoriaId}</p>}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destaque} onChange={(e) => set('destaque', e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                <span className="text-sm text-slate-700">Exibir como destaque na vitrine</span>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Estoque e identificação</h2>
            <p className="text-xs text-slate-500 mb-4">
              O estoque é controlado por variação. Preenchendo aqui, criamos automaticamente uma variação padrão.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantidade em estoque" type="number" placeholder="0" value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)} />
              <Input label="SKU" placeholder="CAM-001" value={form.sku} onChange={(e) => set('sku', e.target.value)} hint="Deixe em branco para gerar automaticamente" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Imagens do produto</h2>
            <p className="text-xs text-slate-500 mb-4">
              Cole a URL de uma imagem hospedada. Para upload de arquivo, integre um serviço de storage (S3, Cloudinary, UploadThing).
            </p>
            <div className="flex gap-2 mb-4">
              <input
                value={novaImagem}
                onChange={(e) => setNovaImagem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarImagem(); } }}
                placeholder="https://exemplo.com/foto.jpg"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <Button variant="outline" onClick={adicionarImagem}><IconPlus className="w-4 h-4" /> Adicionar</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagens.map((img, i) => (
                <div key={img.id} className={`aspect-square rounded-xl overflow-hidden relative border ${i === 0 ? 'border-indigo-200 ring-2 ring-indigo-500' : 'border-slate-200'}`}>
                  <Img src={img.url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <IconCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => removerImagem(img)}
                    className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600"
                    aria-label="Remover imagem"
                  >
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {imagens.length === 0 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 text-slate-300">
                  <IconPlus className="w-6 h-6" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">A primeira imagem é a principal da vitrine.</p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Publicação</h2>
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo (rascunho)</option>
            </Select>
            <Divider />
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Publicar produto'}
              </Button>
              <Button variant="outline" fullWidth onClick={() => router.push('/painel/produtos')}>Cancelar</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Prévia</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="aspect-square bg-slate-100">
                {imagens[0] ? <Img src={imagens[0].url} alt="" className="w-full h-full object-cover" /> : <Placeholder />}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 truncate">{form.nome || 'Nome do produto'}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{precoPreview}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
