import { NextResponse } from 'next/server';
import { encerrarSessao } from '@/src/lib/auth';

export async function POST() {
    await encerrarSessao();
    return NextResponse.json({ ok: true }, { status: 200 });
}