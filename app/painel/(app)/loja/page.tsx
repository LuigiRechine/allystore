'use client';

// Personalização da loja + gestão de categorias (as categorias vivem na
// tabela Categoria e são pré-requisito para cadastrar produtos).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MerchantLayout from '@/src/components/MerchantLayout';
import { api } from '@/src/lib/api';
import { slugify } from '@/src/lib/format';
import { sessaoLojista, type SessaoLojista } from '@/src/lib/session';
import {
  Badge, Button, Card, Divider, Img, Input, PageHeader, Textarea, Loading, useToast,
  IconPlus, IconTrash, IconStore,
} from '@/src/components/ui';
import type { Categoria } from '@/src/lib/types';

export default function MinhaLojaPage() {
  const { show, ToastEl } = useToast();
  const [sessao, setSessao] = useState<SessaoLojista | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  const [form, setForm] = useState({
    nome: '', descricao: '', slug: '', email: '', telefone: '', logo: '', status: 'ativo',
  });

  useEffect(() => {
    const s = sessaoLojista.ler();
    if (!s) return;
    setSessao(s);
    setForm({
      nome: s.loja.nome,
      descricao: s.loja.descricao ?? '',
      slug: s.loja.slug,
      email: s.loja.email,
      telefone: s.loja.telefone ?? '',
      logo: s.loja.logo ?? '',
      status: s.loja.status,
    });
    (async () => {
      try {
        const cs = await api.categoria.listar();
        setCategorias(cs.filter((c) => Number(c.lojaId) === s.loja.id));
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const salvar = async () => {
    if (!sessao) return;
    setSalvando(true);
    try {
      const atualizada = await api.loja.atualizar(sessao.loja.id, {
        nome: form.nome,
        slug: slugify(form.slug),
        email: form.email,
        status: form.status,
        logo: form.logo || null,
        descricao: form.descricao || null,
        telefone: form.telefone || null,
      });
      const nova = { ...sessao, loja: { ...sessao.loja, ...atualizada } };
      sessaoLojista.gravar(nova);
      setSessao(nova);
      show('Alterações salvas com sucesso!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao salvar.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const criarCategoria = async () => {
    if (!sessao || !novaCategoria.trim()) return;
    try {
      const c = await api.categoria.criar({
        nome: novaCategoria.trim(), status: 'ativo', lojaId: sessao.loja.id, descricao: null,
      });
      setCategorias((cs) => [...cs, c]);
      setNovaCategoria('');
      show('Categoria criada!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao criar categoria.', 'error');
    }
  };

  const excluirCategoria = async (c: Categoria) => {
    try {
      await api.categoria.excluir(c.id);
      setCategorias((cs) => cs.filter((x) => x.id !== c.id));
      show('Categoria excluída.');
    } catch {
      show('Não é possível excluir: existem produtos nesta categoria.', 'error');
    }
  };

  if (!sessao || carregando) return <MerchantLayout title="Minha Loja"><Loading /></MerchantLayout>;

  return (
    <MerchantLayout title="Minha Loja">
      {ToastEl}
      <PageHeader title="Personalização da loja" description="Configure a aparência e informações públicas da sua loja" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Informações básicas</h2>
            <div className="space-y-4">
              <Input label="Nome da loja" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint={`/loja/${slugify(form.slug)}`} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Identidade visual</h2>
            <p className="text-xs text-slate-500 mb-4">Cole a URL de uma imagem hospedada para usar como logo.</p>
            <div className="grid sm:grid-cols-2 gap-4 items-start">
              <Input label="URL da logo" placeholder="https://..." value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Prévia</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50">
                  {form.logo ? (
                    <Img src={form.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover mx-auto mb-2" />
                  ) : (
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                      {form.nome.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">{form.logo ? 'Logo carregada' : 'Usando iniciais'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Contato</h2>
            <div className="space-y-3">
              <Input label="E-mail de contato" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="WhatsApp / telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-slate-900">Categorias</h2>
              <Badge color="slate">{categorias.length}</Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">Todo produto precisa pertencer a uma categoria.</p>
            <div className="flex gap-2 mb-4">
              <input
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); criarCategoria(); } }}
                placeholder="Ex: Camisetas"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <Button variant="outline" onClick={criarCategoria}><IconPlus className="w-4 h-4" /> Adicionar</Button>
            </div>
            {categorias.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma categoria cadastrada ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {categorias.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-800">{c.nome}</span>
                    <button onClick={() => excluirCategoria(c)} className="text-slate-400 hover:text-red-600 transition-colors" aria-label="Excluir categoria">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <div className="sticky top-4 space-y-4">
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Prévia</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-white px-3 py-2 border-b border-slate-100 flex items-center gap-2">
                  {form.logo ? (
                    <Img src={form.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 bg-pink-500 rounded-full" />
                  )}
                  <span className="font-bold text-slate-800 truncate">{form.nome}</span>
                </div>
                <div className="h-16 bg-gradient-to-br from-slate-700 to-slate-900" />
                <div className="p-2 grid grid-cols-3 gap-1">
                  {['#f1f5f9', '#e2e8f0', '#cbd5e1'].map((c, i) => <div key={i} className="rounded-lg h-12" style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <Link href={`/loja/${sessao.loja.slug}`} target="_blank">
                <Button variant="outline" fullWidth size="sm" className="mt-3">
                  <IconStore className="w-4 h-4" /> Ver loja pública
                </Button>
              </Link>
              <Divider />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.status === 'ativo'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'ativo' : 'inativo' })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Loja visível ao público</span>
              </label>
            </Card>
            <Button fullWidth onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
