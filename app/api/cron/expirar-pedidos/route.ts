import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { expirarPedidosAbandonados } from '@/src/service/mercadoPagoService';

// Chamado pelo Vercel Cron (veja vercel.json). A Vercel envia "Authorization: Bearer <CRON_SECRET>"
// automaticamente quando a variável CRON_SECRET existe no projeto.

export async function GET(req: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  const enviado = req.headers.get('authorization') ?? '';
  const esperado = `Bearer ${segredo}`;
  const a = Buffer.from(enviado);
  const b = Buffer.from(esperado);
  if (!segredo || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }
  return NextResponse.json(await expirarPedidosAbandonados());
}
