import { NextResponse, type NextRequest } from 'next/server';
import { mp } from '@/src/lib/mercadopago/config';
import { assinaturaValida } from '@/src/lib/mercadopago/assinatura';
import { ErroMP } from '@/src/lib/mercadopago/client';
import { sincronizarPagamento } from '@/src/service/mercadoPagoService';

// Notificações do Mercado Pago. URL (definida em cada preferência):
//   /api/webhook/mercadopago?lojaId=<id>
//
// Segurança em duas camadas:
//  1. se MP_WEBHOOK_SECRET existir, o x-signature é validado (HMAC-SHA256);
//  2. mesmo assim NADA do corpo é confiado: o status real é buscado na API do MP com o token da loja.
//
// Resposta 2xx = "recebi" (o MP para de reenviar). 5xx = o MP tenta de novo mais tarde.

export async function POST(req: NextRequest) {
  const url = req.nextUrl;
  let corpo: { type?: string; data?: { id?: string | number } } = {};
  try { corpo = await req.json(); } catch { /* alguns avisos vêm sem corpo */ }

  const tipo = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? corpo.type;
  const dataId = url.searchParams.get('data.id') ?? (corpo.data?.id != null ? String(corpo.data.id) : null);
  const lojaId = Number(url.searchParams.get('lojaId'));

  const segredo = mp.webhookSecret();
  if (segredo) {
    const ok = assinaturaValida({
      xSignature: req.headers.get('x-signature'),
      xRequestId: req.headers.get('x-request-id'),
      dataId: url.searchParams.get('data.id') ?? dataId,
      segredo,
    });
    if (!ok) return NextResponse.json({ erro: 'Assinatura inválida.' }, { status: 401 });
  }

  if (tipo !== 'payment' || !dataId || !/^\d+$/.test(dataId) || !Number.isInteger(lojaId)) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  try {
    const r = await sincronizarPagamento(dataId, lojaId);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    // 4xx do MP (ex.: id de teste inexistente) não adianta reenviar; falha de rede/5xx sim
    if (e instanceof ErroMP && e.status < 500) return NextResponse.json({ ok: true, ignorado: true });
    console.error('[webhook/mercadopago]', e);
    return NextResponse.json({ erro: 'Falha ao processar.' }, { status: 500 });
  }
}

// O MP às vezes valida a URL com GET.
export async function GET() {
  return NextResponse.json({ ok: true });
}
