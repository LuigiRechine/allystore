import { NextResponse } from 'next/server';
import { AuthService } from '@/src/service/authService';
import { lerSessao, respostaDeErro } from '@/src/lib/auth';

const service = new AuthService();

export async function POST(req) {
    try {
        const sessao = await lerSessao();
        if (!sessao) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

        const body = await req.json();
        await service.alterarSenha(sessao.id, body.atual, body.nova);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e) {
        return respostaDeErro(e);
    }
}