import prisma from '@/src/lib/prisma';
import { criptografar, descriptografar } from './crypto';
import { ErroMP, renovarToken, type RespostaOAuth } from './client';

const RENOVAR_COM_ANTECEDENCIA_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function expiraEm(r: RespostaOAuth) {
  return new Date(Date.now() + r.expires_in * 1000);
}

export async function salvarConta(lojaId: number, r: RespostaOAuth) {
  const dados = {
    mpUserId: String(r.user_id),
    accessToken: criptografar(r.access_token),
    refreshToken: criptografar(r.refresh_token),
    publicKey: r.public_key ?? null,
    liveMode: r.live_mode ?? true,
    expiraEm: expiraEm(r),
  };
  await prisma.mercadoPagoConta.upsert({
    where: { lojaId },
    create: { lojaId, ...dados },
    update: dados,
  });
}

/** Devolve o access_token da loja, renovando-o se estiver perto de vencer. */
export async function tokenDaLoja(lojaId: number): Promise<string> {
  const conta = await prisma.mercadoPagoConta.findUnique({ where: { lojaId } });
  if (!conta) throw new ErroMP('Esta loja ainda não conectou o Mercado Pago.', 409);

  if (conta.expiraEm.getTime() - Date.now() > RENOVAR_COM_ANTECEDENCIA_MS) {
    return descriptografar(conta.accessToken);
  }

  // O refresh_token é de uso único: o novo par precisa ser gravado já.
  const novo = await renovarToken(descriptografar(conta.refreshToken));
  await salvarConta(lojaId, novo);
  return novo.access_token;
}

export async function statusDaConta(lojaId: number) {
  const conta = await prisma.mercadoPagoConta.findUnique({
    where: { lojaId },
    select: { mpUserId: true, liveMode: true, conectadoEm: true, expiraEm: true },
  });
  return conta
    ? { conectado: true as const, mpUserId: conta.mpUserId, liveMode: conta.liveMode, conectadoEm: conta.conectadoEm }
    : { conectado: false as const };
}

export async function desconectarConta(lojaId: number) {
  await prisma.mercadoPagoConta.deleteMany({ where: { lojaId } });
}
