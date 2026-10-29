import { NextResponse, type NextRequest } from 'next/server';
import { lerSessao } from '@/src/lib/auth';
import { consultarStatus, ErroCheckout } from '@/src/service/mercadoPagoService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ pedidoId: string }> }) {
  try {
    const sessao = await lerSessao();
    if (!sessao || sessao.tipo !== 'cliente') {
      return NextResponse.json({ erro: 'Faça login para continuar.' }, { status: 401 });
    }
    const { pedidoId } = await params;
    const id = Number(pedidoId);
    if (!Number.isInteger(id)) return NextResponse.json({ erro: 'Pedido inválido.' }, { status: 400 });

    const paymentId = req.nextUrl.searchParams.get('payment_id');
    const r = await consultarStatus(sessao.id, id, paymentId && /^\d+$/.test(paymentId) ? paymentId : null);
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof ErroCheckout) return NextResponse.json({ erro: e.message }, { status: e.status });
    console.error('[checkout/status]', e);
    return NextResponse.json({ erro: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
