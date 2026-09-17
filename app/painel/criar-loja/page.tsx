'use client';

// Onboarding: cria Usuario (tipo "lojista") + Loja + Lojista em sequência,
// usando as rotas que já existem no backend.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { slugify } from '@/src/lib/format';
import { sessaoLojista } from '@/src/lib/session';
import {
  AllysToreLogo, Button, Card, Input, Textarea, ProgressSteps, IconCheck, IconStore,
} from '@/src/components/ui';

const PASSOS = ['Sua conta', 'Sua loja', 'Confirmar'];

export default function CriarLojaPage() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criada, setCriada] = useState<{ slug: string } | null>(null);

  const [conta, setConta] = useState({ nome: '', email: '', senha: '', telefone: '' });
  const [loja, setLoja] = useState({ nome: '', descricao: '', slug: '', email: '', telefone: '', logo: '' });

  const setNomeLoja = (valor: string) => {
    setLoja((l) => ({ ...l, nome: valor, slug: l.slug || slugify(valor) }));
  };

  const validarPasso = () => {
    if (passo === 0) {
      if (!conta.nome || !conta.email || !conta.senha) return 'Preencha nome, e-mail e senha.';
      if (conta.senha.length < 8) return 'A senha precisa ter ao menos 8 caracteres.';
    }
    if (passo === 1) {
      if (!loja.nome || !loja.slug) return 'Preencha o nome e o link da loja.';
    }
    return null;
  };

  const avancar = () => {
    const problema = validarPasso();
    if (problema) { setErro(problema); return; }
    setErro(null);
    setPasso((p) => p + 1);
  };

  const criar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      const usuario = await api.usuario.criar({
        nome: conta.nome,
        email: conta.email,
        senha: conta.senha,
        telefone: conta.telefone,
        tipo: 'lojista',
        status: 'ativo',
      });

      const novaLoja = await api.loja.criar({
        nome: loja.nome,
        slug: slugify(loja.slug),
        email: loja.email || conta.email,
        status: 'ativo',
        logo: loja.logo || null,
        descricao: loja.descricao || null,
        telefone: loja.telefone || conta.telefone,
      });

      const lojista = await api.lojista.criar({
        cargo: 'proprietario',
        usuarioId: usuario.id,
        lojaId: novaLoja.id,
      });

      sessaoLojista.gravar({ usuario, lojista, loja: novaLoja });
      setCriada({ slug: novaLoja.slug });
      setPasso(3);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar a loja.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <AllysToreLogo />
        <button onClick={() => router.push('/painel/entrar')} className="text-sm text-slate-500 hover:text-slate-700">
          Já tenho conta
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-900">Configure sua loja</h1>
          <p className="text-slate-500 mt-1">Preencha as informações abaixo para começar a vender</p>
        </div>

        <div className="flex justify-center mb-10">
          <ProgressSteps steps={PASSOS} current={Math.min(passo, 2)} />
        </div>

        <Card className="p-8">
          {passo === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Seus dados de acesso</h2>
              <Input label="Nome completo *" placeholder="Renata Silva" value={conta.nome} onChange={(e) => setConta({ ...conta, nome: e.target.value })} />
              <Input label="E-mail *" type="email" placeholder="voce@email.com" value={conta.email} onChange={(e) => setConta({ ...conta, email: e.target.value })} />
              <Input label="Telefone" placeholder="(11) 99999-9999" value={conta.telefone} onChange={(e) => setConta({ ...conta, telefone: e.target.value })} />
              <Input label="Senha *" type="password" placeholder="Mínimo 8 caracteres" value={conta.senha} onChange={(e) => setConta({ ...conta, senha: e.target.value })} />
            </div>
          )}

          {passo === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Informações da loja</h2>
              <Input label="Nome da loja *" placeholder="Ex: Minha Boutique" value={loja.nome} onChange={(e) => setNomeLoja(e.target.value)} hint="Este será o nome público da sua loja" />
              <Textarea label="Descrição" placeholder="Descreva sua loja e o que você vende..." value={loja.descricao} onChange={(e) => setLoja({ ...loja, descricao: e.target.value })} />
              <Input label="Link da loja (slug) *" placeholder="minha-boutique" value={loja.slug} onChange={(e) => setLoja({ ...loja, slug: e.target.value })} hint={`/loja/${slugify(loja.slug) || 'minha-loja'}`} />
              <Input label="E-mail de contato" type="email" placeholder="contato@minhaloja.com" value={loja.email} onChange={(e) => setLoja({ ...loja, email: e.target.value })} />
              <Input label="WhatsApp" placeholder="(11) 99999-9999" value={loja.telefone} onChange={(e) => setLoja({ ...loja, telefone: e.target.value })} />
              <Input label="URL da logo" placeholder="https://..." value={loja.logo} onChange={(e) => setLoja({ ...loja, logo: e.target.value })} hint="Cole o link de uma imagem. Upload de arquivo exige um serviço de storage." />
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-slate-900">Confira antes de criar</h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 h-10 flex items-center gap-2 px-4">
                  {['bg-red-400', 'bg-amber-400', 'bg-emerald-400'].map((c, i) => <div key={i} className={`w-3 h-3 rounded-full ${c}`} />)}
                  <div className="flex-1 bg-slate-700 rounded-full h-5 mx-4 flex items-center px-3">
                    <span className="text-[10px] text-slate-300 truncate">/loja/{slugify(loja.slug)}</span>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div className="bg-pink-500 h-20 rounded-lg mb-3 flex items-center px-4">
                    <p className="text-white font-bold truncate">{loja.nome}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['#f1f5f9', '#e2e8f0', '#cbd5e1'].map((c, i) => <div key={i} className="rounded-lg h-24" style={{ backgroundColor: c }} />)}
                  </div>
                </div>
              </div>
              <dl className="text-sm divide-y divide-slate-100">
                <div className="flex justify-between py-2"><dt className="text-slate-500">Responsável</dt><dd className="text-slate-800">{conta.nome}</dd></div>
                <div className="flex justify-between py-2"><dt className="text-slate-500">E-mail de acesso</dt><dd className="text-slate-800">{conta.email}</dd></div>
                <div className="flex justify-between py-2"><dt className="text-slate-500">Loja</dt><dd className="text-slate-800">{loja.nome}</dd></div>
              </dl>
            </div>
          )}

          {passo === 3 && criada && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Tudo pronto!</h2>
              <p className="text-slate-600 mt-2 mb-6">Sua loja está criada e pronta para receber produtos.</p>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-indigo-900">Link da sua loja:</p>
                <p className="text-indigo-600 font-mono text-sm mt-1">/loja/{criada.slug}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => router.push(`/loja/${criada.slug}`)}>Ver loja</Button>
                <Button fullWidth onClick={() => router.push('/painel')}>Ir para o painel</Button>
              </div>
            </div>
          )}

          {erro && <p className="text-sm text-red-600 mt-4">{erro}</p>}

          {passo < 3 && (
            <div className="flex gap-3 mt-8">
              {passo > 0 && <Button variant="outline" onClick={() => setPasso((p) => p - 1)}>Voltar</Button>}
              <Button
                fullWidth={passo === 0}
                className="ml-auto"
                disabled={enviando}
                onClick={() => (passo < 2 ? avancar() : criar())}
              >
                {passo === 2 ? (enviando ? 'Criando...' : 'Criar minha loja') : 'Próximo'}
              </Button>
            </div>
          )}
        </Card>

        {passo === 1 && (
          <div className="mt-6 flex items-center gap-3 text-xs text-slate-500 justify-center">
            <IconStore className="w-4 h-4" />
            Você pode mudar todos esses dados depois em Painel → Loja.
          </div>
        )}
      </div>
    </div>
  );
}
