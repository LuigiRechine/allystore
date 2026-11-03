import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { lerSessao } from '@/src/lib/auth';
import { urlApp } from '@/src/lib/mercadopago/config';
import { trocarCodigoPorToken } from '@/src/lib/mercadopago/client';
import { salvarConta } from '@/src/lib/mercadopago/contaLoja';

// Redirect URL cadastrada no app do Mercado Pago: /api/mercadopago/oauth/callback

function voltar(resultado: 'conectado' | 'erro') {
  const r = NextResponse.redirect(`${urlApp()}/painel/configuracoes?aba=pagamentos&mp=${resultado}`);
  r.cookies.delete({ name: 'mp_pkce', path: '/api/mercadopago/oauth' }); // o verifier é de uso único
  return r;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  if (req.nextUrl.searchParams.get('error') || !code || !state) return voltar('erro');

  try {
    const sessao = await lerSessao();
    if (!sessao || sessao.tipo !== 'lojista') return voltar('erro');

    const segredo = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
    const { payload } = await jwtVerify(state, segredo);
    if (payload.fim !== 'mp-oauth' || Number(payload.usuarioId) !== sessao.id) return voltar('erro');

    const verifier = req.cookies.get('mp_pkce')?.value;
    if (!verifier) return voltar('erro'); // cookie expirou (10 min) ou o fluxo não começou por /connect

    const tokens = await trocarCodigoPorToken(code, verifier);
    await salvarConta(Number(payload.lojaId), tokens);
    return voltar('conectado');
  } catch (e) {
    console.error('[mercadopago/callback]', e);
    return voltar('erro');
  }
}
