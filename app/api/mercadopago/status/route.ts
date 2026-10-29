import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import { lerSessao } from '@/src/lib/auth';
import { desconectarConta, statusDaConta } from '@/src/lib/mercadopago/contaLoja';

async function lojaDoLojista() {
  const sessao = await lerSessao();
  if (!sessao || sessao.tipo !== 'lojista') return null;
  const v = await prisma.lojista.findFirst({ where: { usuarioId: sessao.id }, select: { lojaId: true, cargo: true } });
  return v;
}

export async function GET() {
  const v = await lojaDoLojista();
  if (!v) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  return NextResponse.json(await statusDaConta(v.lojaId));
}

export async function DELETE() {
  const v = await lojaDoLojista();
  if (!v) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  await desconectarConta(v.lojaId);
  return NextResponse.json({ conectado: false });
}
