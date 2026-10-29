'use client';

// Tela de retorno do Mercado Pago. Mostra o status REAL do pagamento:
// quem manda é o webhook (e, enquanto ele não chega, uma consulta direta ao Mercado Pago
// feita pelo servidor em /api/checkout/status). Não existe mais "simular aprovação".

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { statusDoCheckout, type StatusCheckout } from '@/src/lib/api';
import { fmt } from '@/src/lib/format';
import { useLoja } from '@/src/context/LojaContext';
import { StoreNav } from '@/src/components/StoreChrome';
import { Button, Loading, ErrorState, IconCheck, IconShield, IconX } from '@/src/components/ui';

const INTERVALO_MS = 4000;
const MAX_TENTATIVAS = 90; // ~6 minutos de espera ativa

export default function PagamentoPage({ params }: { params: Promise<{ slug: string; pedidoId: string }> }) {
  const { pedidoId } = use(params);
  const loja = useLoja();
  const router = useRouter();

  const [dados, setDados] = useState<StatusCheckout | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const tentativas = useRef(0);
  const paymentId = useRef<string | null>(null);

  // O Mercado Pago devolve ?payment_id=...&status=...&external_reference=... na URL de retorno.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    paymentId.current = q.get('payment_id') ?? q.get('collection_id');
  }, []);

  const consultar = useCallback(async () => {
    try {
      const r = await statusDoCheckout(pedidoId, paymentId.current);
      setDados(r);
      setErro(null);
      return r;
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar o pagamento.');
      return null;
    } finally {
      setCarregando(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;
    const ciclo = async () => {
      const r = await consultar();
      if (!ativo) return;
      const aguardando = r?.pagamento?.status === 'pendente';
      if (aguardando && tentativas.current++ < MAX_TENTATIVAS) timer = setTimeout(ciclo, INTERVALO_MS);
    };
    ciclo();
    return () => { ativo = false; clearTimeout(timer); };
  }, [consultar]);

  if (carregando) return <div className="min-h-screen bg-slate-50"><StoreNav /><Loading /></div>;
  if (erro || !dados || !dados.pagamento) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreNav />
        <ErrorState message={erro ?? 'Pagamento não encontrado.'} onRetry={consultar} />
      </div>
    );
  }

  const pg = dados.pagamento;
  const aprovado = pg.status === 'aprovado';
  const recusado = pg.status === 'recusado';
  const pendente = pg.status === 'pendente';
  const encerrado = ['cancelado', 'expirado', 'estornado'].includes(pg.status);

  const titulo = aprovado ? 'Pagamento aprovado!'
    : recusado ? 'Pagamento recusado'
    : pendente ? 'Aguardando pagamento'
    : 'Pedido não concluído';

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreNav />

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500">Pedido #{dados.pedidoId} • {fmt(pg.valor)}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{titulo}</h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          {aprovado && (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-slate-600 mb-6">
                Recebemos o seu pagamento de <strong>{fmt(pg.valor)}</strong>. A loja já foi avisada.
              </p>
              <Button fullWidth onClick={() => router.push(`/loja/${loja.slug}/confirmacao/${dados.pedidoId}`)}>
                Ver confirmação do pedido
              </Button>
            </>
          )}

          {pendente && (
            <>
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-5" />
              <p className="text-slate-600 mb-2">
                {pg.metodo === 'pix'
                  ? 'Assim que o Pix for confirmado esta tela atualiza sozinha.'
                  : 'Estamos aguardando a confirmação do Mercado Pago.'}
              </p>
              <p className="text-xs text-slate-400 mb-6">Pode levar alguns instantes. Você não precisa recarregar a página.</p>
              {pg.linkPagamento && (
                <Button fullWidth variant="outline" onClick={() => { window.location.href = pg.linkPagamento!; }}>
                  Ainda não paguei — abrir pagamento
                </Button>
              )}
            </>
          )}

          {recusado && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconX className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-slate-600 mb-6">
                O pagamento não foi aprovado. Você pode tentar novamente com outro cartão ou pagar com Pix.
              </p>
              {pg.linkPagamento && (
                <Button fullWidth onClick={() => { window.location.href = pg.linkPagamento!; }}>Tentar novamente</Button>
              )}
            </>
          )}

          {encerrado && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconX className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-slate-600 mb-6">
                {pg.status === 'estornado'
                  ? 'Este pagamento foi estornado.'
                  : 'O prazo para pagar este pedido acabou ou ele foi cancelado. Faça um novo pedido para comprar.'}
              </p>
              <Button fullWidth onClick={() => router.push(`/loja/${loja.slug}`)}>Voltar à loja</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 justify-center mt-6">
          <IconShield className="w-4 h-4 text-slate-400" />
          <p className="text-xs text-slate-400">Pagamento processado pelo Mercado Pago</p>
        </div>
      </div>
    </div>
  );
}
