'use client';

// Login/cadastro do cliente da loja.
// Cadastro cria Usuario (tipo "cliente") + Cliente vinculado a esta loja.

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, login, registrar } from '@/src/lib/api';
import { useLoja } from '@/src/context/LojaContext';
import { sessaoCliente } from '@/src/lib/session';
import { StoreNav } from '@/src/components/StoreChrome';
import { Button, Divider, Input, IconChevronLeft } from '@/src/components/ui';

type Modo = 'login' | 'cadastro';

function ConteudoEntrar() {
  const loja = useLoja();
  const router = useRouter();
  const search = useSearchParams();
  const destino = search.get('redirect') === 'checkout' ? 'checkout' : '';

  const [modo, setModo] = useState<Modo>('login');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', confirmar: '', cpf: '', telefone: '',
  });

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const irPara = () => router.replace(`/loja/${loja.slug}/${destino}`);

  const entrar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      const { usuario, clientes } = await login(form.email, form.senha);
      const cliente = clientes?.find((c) => Number(c.lojaId) === loja.id);
      if (!cliente) {
        setErro('Esta conta ainda não é cliente desta loja. Crie um cadastro abaixo.');
        setModo('cadastro');
        return;
      }
      sessaoCliente.gravar(loja.slug, { usuario, cliente });
      irPara();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  };

  const cadastrar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      if (form.senha !== form.confirmar) throw new Error('As senhas não conferem.');
      if (form.senha.length < 8) throw new Error('A senha precisa ter ao menos 8 caracteres.');

      const { usuario, clientes } = await registrar({
        tipo: 'cliente',
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
        cpf: form.cpf,
        lojaId: loja.id,
      });
      const cliente = clientes?.find((c) => Number(c.lojaId) === loja.id);
      if (!cliente) throw new Error('Não foi possível concluir o cadastro.');

      sessaoCliente.gravar(loja.slug, { usuario, cliente });
      irPara();
      
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StoreNav />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {modo === 'login' ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Entrar na minha conta</h1>
                <p className="text-sm text-slate-500 mb-6">Acesse seus pedidos em {loja.nome}</p>
                <div className="space-y-4">
                  <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} />
                  <Input label="Senha" type="password" placeholder="••••••••" value={form.senha} onChange={set('senha')} />
                </div>
                {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
                <Button fullWidth size="lg" className="mt-5" onClick={entrar} disabled={enviando}>
                  {enviando ? 'Entrando...' : 'Entrar'}
                </Button>
                <Divider label="ou" />
                <Button variant="outline" fullWidth size="lg" onClick={() => { setModo('cadastro'); setErro(null); }}>
                  Criar conta
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar conta</h1>
                <p className="text-sm text-slate-500 mb-6">Rápido e fácil</p>
                <div className="space-y-3">
                  <Input label="Nome completo" placeholder="Seu nome" value={form.nome} onChange={set('nome')} />
                  <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} />
                  <Input label="Telefone" placeholder="(11) 99999-9999" value={form.telefone} onChange={set('telefone')} />
                  <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={set('cpf')} />
                  <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={set('senha')} />
                  <Input label="Confirmar senha" type="password" placeholder="••••••••" value={form.confirmar} onChange={set('confirmar')} />
                </div>
                {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}
                <Button fullWidth size="lg" className="mt-5" onClick={cadastrar} disabled={enviando}>
                  {enviando ? 'Criando...' : 'Criar conta'}
                </Button>
                <Divider label="ou" />
                <Button variant="ghost" fullWidth onClick={() => { setModo('login'); setErro(null); }}>
                  <IconChevronLeft className="w-4 h-4" /> Já tenho conta
                </Button>
              </>
            )}
          </div>
          <p className="text-center mt-4">
            <Link href={`/loja/${loja.slug}`} className="text-xs text-slate-400 hover:text-slate-600">Voltar à loja</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <ConteudoEntrar />
    </Suspense>
  );
}
