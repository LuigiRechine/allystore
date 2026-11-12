
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const NOME_COOKIE = 'token';
const SETE_DIAS = 60 * 60 * 24 * 7;

function segredo() {
  const s = process.env.JWT_SECRET;

  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET ausente ou curto (mínimo 32 caracteres).');
  }

  return new TextEncoder().encode(s);
}

async function validarToken(token: string): Promise<{
  id: number;
  tipo: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, segredo(), {
      algorithms: ['HS256'],
    });

    const id = Number(payload.id);
    const tipo = String(payload.tipo ?? '');

    if (!Number.isInteger(id) || id <= 0 || !tipo) {
      return null;
    }

    return { id, tipo };
  } catch {
    return null;
  }
}

export async function criarSessao(usuario: {
  id: number;
  tipo: string;
}) {
  const token = await new SignJWT({
    id: usuario.id,
    tipo: usuario.tipo,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(segredo());

  // Mantém a autenticação da versão web.
  (await cookies()).set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SETE_DIAS,
  });

  // Devolve o JWT para o aplicativo mobile.
  return token;
}

export async function encerrarSessao() {
  (await cookies()).delete(NOME_COOKIE);
}

export async function lerSessao(
  req?: Request
): Promise<{ id: number; tipo: string } | null> {

  // Primeiro tenta autenticação pelo Bearer Token (mobile).
  const authorization = req?.headers.get('authorization');

  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) return null;

    return validarToken(match[1].trim());
  }

  // Se não houver Authorization, utiliza o cookie (web).
  const token = (await cookies()).get(NOME_COOKIE)?.value;

  if (!token) return null;

  return validarToken(token);
}

/** Erros de negócio mostram a mensagem; outros viram erro interno. */
export function respostaDeErro(e: unknown) {
  const err = e as {
    name?: string;
    status?: number;
    message?: string;
  };

  if (err?.name === 'ErroAuth') {
    return NextResponse.json(
      { erro: err.message },
      { status: err.status ?? 400 }
    );
  }

  console.error(e);

  return NextResponse.json(
    { erro: 'Erro interno. Tente novamente.' },
    { status: 500 }
  );
}
