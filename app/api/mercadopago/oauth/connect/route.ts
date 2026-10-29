import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import prisma from '@/src/lib/prisma';
import { lerSessao } from '@/src/lib/auth';
import { AUTH_MP, mp, redirectUriOAuth } from '@/src/lib/mercadopago/config';

// O lojista clica em "Conectar Mercado Pago" -> vem para cá -> é enviado ao Mercado Pago autorizar.
// O `state` é um JWT curto assinado com o ID do lojista/loja: na volta, só aceitamos o código
// se o state for válido e pertencer à mesma sessão (protege contra CSRF / troca de conta).

export async function GET() {
  try {
    const sessao = await lerSessao();
    if (!sessao || sessao.tipo !== 'lojista') {
      return NextResponse.json({ erro: 'Faça login como lojista.' }, { status: 401 });
    }
    const vinculo = await prisma.lojista.findFirst({ where: { usuarioId: sessao.id }, select: { lojaId: true } });
    if (!vinculo) return NextResponse.json({ erro: 'Você não está vinculado a nenhuma loja.' }, { status: 403 });

    const segredo = new TextEncoder().encode(process.env.JWT_SECRET ?? '');
    const state = await new SignJWT({ usuarioId: sessao.id, lojaId: vinculo.lojaId, fim: 'mp-oauth' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(segredo);

    const url = new URL(AUTH_MP);
    url.searchParams.set('client_id', mp.clientId());
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('platform_id', 'mp');
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', redirectUriOAuth());
    return NextResponse.redirect(url);
  } catch (e) {
    console.error('[mercadopago/connect]', e);
    return NextResponse.json({ erro: 'Não foi possível iniciar a conexão com o Mercado Pago.' }, { status: 500 });
  }
}
