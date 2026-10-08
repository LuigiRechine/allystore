import { NextResponse } from 'next/server';
import { AuthService } from '@/src/service/authService';
import { lerSessao, respostaDeErro } from '@/src/lib/auth';

const service = new AuthService();

export async function GET() {
    try {
        const sessao = await lerSessao();
        if (!sessao) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });

        const perfil = await service.montarPerfil(sessao.id);
        if (!perfil || perfil.usuario.status !== 'ativo') {
            return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
        }
        return NextResponse.json(perfil, { status: 200 });
    } catch (e) {
        return respostaDeErro(e);
    }
}