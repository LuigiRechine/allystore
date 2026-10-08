import { NextResponse } from 'next/server';
import { AuthService } from '@/src/service/authService';
import { criarSessao, respostaDeErro } from '@/src/lib/auth';

const service = new AuthService();

// tipo "cliente": { nome, email, senha, telefone, cpf, lojaId }
// tipo "lojista": { nome, email, senha, telefone, loja: { nome, slug, email?, telefone?, logo?, descricao? } }
export async function POST(req) {
    try {
        const body = await req.json();
        const perfil = await service.registrar(body);
        await criarSessao(perfil.usuario);
        return NextResponse.json(perfil, { status: 201 });
    } catch (e) {
        return respostaDeErro(e);
    }
}