'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { dataCurta, fmt, iniciais } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { sessaoCliente, type SessaoCliente } from '@/src/lib/session';
import { StoreNav } from '@/src/components/StoreChrome';
import {
  Button, Card, Input, Tabs, Divider, EmptyState, Loading, OrderStatusBadge,
  IconChevronRight, IconLogOut, IconClipboard, useToast,
} from '@/src/components/ui';
import type { Pedido, ProdutoPedido } from '@/src/lib/types';

export default function ContaPage() {
  const loja = useLoja();
  const router = useRouter();
  const { show, ToastEl } = useToast();

  const [sessao, setSessao] = useState<SessaoCliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itens, setItens] = useState<ProdutoPedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState('pedidos');
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' });

  useEffect(() => {
    const s = sessaoCliente.ler(loja.slug);
    if (!s) {
      router.replace(`/loja/${loja.slug}/entrar`);
      return;
    }
    setSessao(s);
    setForm({ nome: s.cliente.nome, email: s.cliente.email, telefone: s.cliente.telefone, cpf: s.cliente.cpf });

    (async () => {
      try {
        const [ps, pps] = await Promise.all([api.pedido.listar(), api.produtoPedido.listar()]);
        setPedidos(
          ps.filter((p) => Number(p.clienteId) === s.cliente.id).sort((a, b) => Number(b.id) - Number(a.id)),
        );
        setItens(pps);
      } finally {
        setCarregando(false);
      }
    })();
  }, [loja.slug, router]);

  const sair = () => {
    sessaoCliente.sair(loja.slug);
    router.replace(`/loja/${loja.slug}`);
  };

  const salvar = async () => {
    if (!sessao) return;
    setSalvando(true);
    try {
      const atualizado = await api.cliente.atualizar(sessao.cliente.id, {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        cpf: form.cpf,
        usuarioId: sessao.cliente.usuarioId,
        lojaId: sessao.cliente.lojaId,
      });
      sessaoCliente.gravar(loja.slug, { ...sessao, cliente: { ...sessao.cliente, ...atualizado } });
      show('Dados atualizados!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao salvar.', 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (!sessao) return <div className="min-h-screen bg-slate-50"><StoreNav /><Loading /></div>;

  const totalDoPedido = (pedidoId: number) =>
    itens.filter((i) => Number(i.pedidoId) === pedidoId).reduce((s, i) => s + Number(i.subtotal), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {ToastEl}
      <StoreNav />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {iniciais(sessao.cliente.nome)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Olá, {sessao.cliente.nome.split(' ')[0]}!</h1>
            <p className="text-sm text-slate-500">{sessao.cliente.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={sair}>
            <IconLogOut className="w-4 h-4" /> Sair
          </Button>
        </div>

        <Tabs
          tabs={[{ id: 'pedidos', label: 'Meus pedidos' }, { id: 'perfil', label: 'Dados pessoais' }]}
          active={aba}
          onChange={setAba}
        />

        <div className="mt-6">
          {aba === 'pedidos' && (
            carregando ? <Loading /> : pedidos.length === 0 ? (
              <EmptyState
                icon={<IconClipboard className="w-8 h-8" />}
                title="Você ainda não fez pedidos"
                description="Quando comprar algo aqui, seus pedidos aparecem nesta lista."
                action={<Button onClick={() => router.push(`/loja/${loja.slug}`)}>Ver produtos</Button>}
              />
            ) : (
              <div className="space-y-3">
                {pedidos.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">#{p.id}</p>
                        <p className="text-xs text-slate-500">{dataCurta(p.data)}</p>
                      </div>
                      <OrderStatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-slate-900">{fmt(totalDoPedido(p.id))}</p>
                      <Link href={`/loja/${loja.slug}/confirmacao/${p.id}`} className="text-indigo-600 text-sm hover:underline flex items-center gap-1">
                        Ver detalhes <IconChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {aba === 'perfil' && (
            <Card className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              </div>
              <Divider />
              <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alterações'}</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
