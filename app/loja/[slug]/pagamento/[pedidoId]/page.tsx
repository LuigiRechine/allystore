'use client';

// Tela de pagamento Pix. O "simular aprovação" existe porque ainda não há
// integração com PSP: ele faz PUT no pagamento (aprovado) e no pedido (pago).
// Quando plugar um provedor real (Mercado Pago, Asaas, Efí...), troque essa
// ação por um webhook que atualize as mesmas duas rotas.

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { StoreNav } from '@/src/components/StoreChrome';
import {
  Button, Divider, QRCodePix, Loading, ErrorState,
  IconCheck, IconCopy, IconShield, IconX, useToast,
} from '@/src/components/ui';
import type { Pagamento, Pedido } from '@/src/lib/types';

const EXPIRA_EM_MIN = 15;

export default function PagamentoPage({ params }: { params: Promise<{ slug: string; pedidoId: string }> }) {
  const { pedidoId } = use(params);
  const loja = useLoja();
  const router = useRouter();
  const { show, ToastEl } = useToast();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [restante, setRestante] = useState(EXPIRA_EM_MIN * 60);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [p, pagamentos] = await Promise.all([api.pedido.buscar(pedidoId), api.pagamento.listar()]);
      setPedido(p);
      const doPedido = pagamentos
        .filter((x) => Number(x.pedidoId) === Number(pedidoId))
        .sort((a, b) => Number(b.id) - Number(a.id))[0];
      setPagamento(doPedido ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o pagamento.');
    } finally {
      setCarregando(false);
    }
  }, [pedidoId]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (pagamento?.status !== 'pendente') return;
    const t = setInterval(() => setRestante((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [pagamento?.status]);

  const codigoPix = pagamento
    ? `00020126580014br.gov.bcb.pix0136${pagamento.codigoTransacao}5204000053039865406${Number(pagamento.valor).toFixed(2)}5802BR59${loja.nome.slice(0, 25).toUpperCase()}6009SAO PAULO62070503***6304`
    : '';

  const copiar = async () => {
    try { await navigator.clipboard.writeText(codigoPix); } catch { /* clipboard bloqueado */ }
    setCopiado(true);
    show('Código Pix copiado!');
    setTimeout(() => setCopiado(false), 2000);
  };

  const confirmarPagamento = async () => {
    if (!pagamento || !pedido) return;
    try {
      await api.pagamento.atualizar(pagamento.id, {
        valor: pagamento.valor,
        metodo: pagamento.metodo,
        status: 'aprovado',
        codigoTransacao: pagamento.codigoTransacao,
        pedidoId: pagamento.pedidoId,
      });
      await api.pedido.atualizar(pedido.id, {
        status: 'pago',
        clienteId: pedido.clienteId,
        lojaId: pedido.lojaId,
      });
      await carregar();
      show('Pagamento aprovado!');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Falha ao confirmar pagamento.', 'error');
    }
  };

  const expirado = restante === 0 && pagamento?.status === 'pendente';
  const aprovado = pagamento?.status === 'aprovado';
  const mm = String(Math.floor(restante / 60)).padStart(2, '0');
  const ss = String(restante % 60).padStart(2, '0');

  if (carregando) return <div className="min-h-screen bg-slate-50"><StoreNav /><Loading /></div>;
  if (erro || !pedido || !pagamento) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreNav />
        <ErrorState message={erro ?? 'Pagamento não encontrado.'} onRetry={carregar} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {ToastEl}
      <StoreNav />

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500">Pedido #{pedido.id} • {fmt(pagamento.valor)}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {aprovado ? 'Pagamento aprovado!' : expirado ? 'Pagamento expirado' : 'Pagamento via Pix'}
          </h1>
        </div>

        {!aprovado && !expirado && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-4"><QRCodePix codigo={pagamento.codigoTransacao} /></div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
              <span>⏱</span> Expira em {mm}:{ss}
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Ou copie o código Pix</p>
            <div className="flex gap-2 mb-4">
              <input readOnly value={`${codigoPix.slice(0, 40)}...`} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 outline-none" />
              <Button variant="outline" size="sm" onClick={copiar}>
                {copiado ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
              </Button>
            </div>
            <Button fullWidth onClick={copiar}><IconCopy className="w-4 h-4" /> Copiar código Pix</Button>

            <Divider label="instruções" />
            <ol className="text-left space-y-2 text-sm text-slate-600">
              {[
                'Abra o aplicativo do seu banco',
                'Selecione a opção de pagamento via Pix',
                'Escaneie o QR Code ou cole o código copiado',
                'Confirme o pagamento e aguarde a aprovação',
              ].map((passo, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {passo}
                </li>
              ))}
            </ol>

            <button onClick={confirmarPagamento} className="mt-6 text-sm text-indigo-600 hover:underline">
              Simular aprovação →
            </button>
          </div>
        )}

        {aprovado && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Pago!</h2>
            <p className="text-slate-600 mt-2 mb-6">
              Seu pagamento de <strong>{fmt(pagamento.valor)}</strong> foi aprovado.
            </p>
            <Button fullWidth onClick={() => router.push(`/loja/${loja.slug}/confirmacao/${pedido.id}`)}>
              Ver confirmação do pedido
            </Button>
          </div>
        )}

        {expirado && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconX className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Código expirado</h2>
            <p className="text-slate-600 mt-2 mb-6">O tempo para pagamento acabou. Refaça o pedido para gerar um novo código.</p>
            <Button fullWidth onClick={() => router.push(`/loja/${loja.slug}`)}>Voltar à loja</Button>
          </div>
        )}

        <div className="flex items-center gap-2 justify-center mt-6">
          <IconShield className="w-4 h-4 text-slate-400" />
          <p className="text-xs text-slate-400">Pagamento processado com segurança</p>
        </div>
      </div>
    </div>
  );
}
