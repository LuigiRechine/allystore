'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, login } from '@/src/lib/api';
import { sessaoLojista } from '@/src/lib/session';
import {
  AllysToreLogo, Button, Divider, Input,
  IconShoppingBag, IconClipboard, IconTrendingUp,
} from '@/src/components/ui';

export default function PainelEntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const entrar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const usuario = await login(email, senha);
      const [lojistas, lojas] = await Promise.all([api.lojista.listar(), api.loja.listar()]);
      const lojista = lojistas.find((l) => Number(l.usuarioId) === Number(usuario.id));
      if (!lojista) throw new Error('Esta conta não está vinculada a nenhuma loja.');
      const loja = lojista.loja ?? lojas.find((l) => l.id === Number(lojista.lojaId));
      if (!loja) throw new Error('Loja do lojista não encontrada.');

      sessaoLojista.gravar({ usuario, lojista, loja });
      router.replace('/painel');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex">
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <AllysToreLogo size="lg" />
        <h2 className="text-4xl font-bold text-white mt-8 leading-tight">
          Gerencie sua loja<br />com simplicidade.
        </h2>
        <p className="text-indigo-300 mt-4 max-w-sm leading-relaxed">
          A plataforma completa para microempreendedores criarem e gerenciarem suas lojas online sem precisar de conhecimento técnico.
        </p>
        <div className="flex flex-col gap-4 mt-12">
          {[
            { icon: <IconShoppingBag className="w-4 h-4" />, text: 'Loja online pronta em minutos' },
            { icon: <IconClipboard className="w-4 h-4" />, text: 'Gestão completa de pedidos' },
            { icon: <IconTrendingUp className="w-4 h-4" />, text: 'Dashboard com métricas em tempo real' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-indigo-200">
              <div className="w-8 h-8 bg-indigo-800 rounded-lg flex items-center justify-center">{item.icon}</div>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white flex flex-col justify-center p-10">
        <div className="lg:hidden mb-8"><AllysToreLogo /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h1>
        <p className="text-sm text-slate-500 mb-8">Entre na sua conta de lojista</p>

        <div className="space-y-4">
          <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Senha" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') entrar(); }} />
        </div>

        {erro && <p className="text-xs text-red-600 mt-3">{erro}</p>}

        <Button fullWidth size="lg" className="mt-6" onClick={entrar} disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </Button>

        <Divider label="ou" />
        <Button variant="outline" fullWidth onClick={() => router.push('/painel/criar-loja')}>
          Criar nova conta
        </Button>

        <p className="text-xs text-slate-400 text-center mt-8">
          Ao entrar você concorda com os Termos de Uso da AllysTore.
        </p>
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 text-center mt-3 underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
