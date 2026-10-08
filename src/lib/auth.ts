import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const NOME_COOKIE = 'token';
const SETE_DIAS = 60 * 60 * 24 * 7;

function segredo() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error('JWT_SECRET ausente ou curto (mínimo 32 caracteres).');
  return new TextEncoder().encode(s);
}

export async function criarSessao(usuario: { id: number; tipo: string }) {
  const token = await new SignJWT({ id: usuario.id, tipo: usuario.tipo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(segredo());

  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SETE_DIAS,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(NOME_COOKIE);
}

export async function lerSessao(): Promise<{ id: number; tipo: string } | null> {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return { id: Number(payload.id), tipo: String(payload.tipo) };
  } catch {
    return null;
  }
}

/** Erros de negócio (ErroAuth) mostram a mensagem; qualquer outro vira "erro interno". */
export function respostaDeErro(e: unknown) {
  const err = e as { name?: string; status?: number; message?: string };
  if (err?.name === 'ErroAuth') {
    return NextResponse.json({ erro: err.message }, { status: err.status ?? 400 });
  }
  console.error(e);
  return NextResponse.json({ erro: 'Erro interno. Tente novamente.' }, { status: 500 });
}