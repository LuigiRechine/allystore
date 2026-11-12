
import { NextResponse } from 'next/server';
import { AuthService } from '@/src/service/authService';
import { criarSessao, respostaDeErro } from '@/src/lib/auth';

const service = new AuthService();

export async function POST(req) {
  try {
    const body = await req.json();

    const perfil = await service.login(
      body.email,
      body.senha
    );

    const token = await criarSessao(perfil.usuario);

    return NextResponse.json(
      {
        ...perfil,
        token,
      },
      { status: 200 }
    );

  } catch (e) {
    return respostaDeErro(e);
  }
}
