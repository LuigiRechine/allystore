import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Valida o header x-signature das notificações do Mercado Pago.
 * Manifest (conforme a documentação): id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 */
export function assinaturaValida(opts: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  segredo: string;
}): boolean {
  const { xSignature, xRequestId, dataId, segredo } = opts;
  if (!xSignature || !dataId) return false;

  let ts: string | undefined;
  let v1: string | undefined;
  for (const parte of xSignature.split(',')) {
    const [k, ...resto] = parte.split('=');
    const valor = resto.join('=').trim();
    if (k.trim() === 'ts') ts = valor;
    if (k.trim() === 'v1') v1 = valor;
  }
  if (!ts || !v1) return false;

  // Se o id for alfanumérico, a doc manda usar minúsculas.
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifesto = `id:${id};request-id:${xRequestId ?? ''};ts:${ts};`;
  const esperado = createHmac('sha256', segredo).update(manifesto).digest('hex');

  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(v1, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
