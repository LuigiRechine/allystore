
import { NextResponse } from 'next/server';
import { AuthService } from '@/src/service/authService';
import { criarSessao, respostaDeErro } from '@/src/lib/auth';

const service = new AuthService();

export async function POST(req) {
  try {
    const body = await req.json();

    // O aplicativo mobile só poderá cadastrar clientes.
    if (body.tipo !== 'cliente') {
      return NextResponse.json(
        { erro: 'Cadastro disponível apenas para clientes.' },
        { status: 403 }
      );
    }

    const perfil = await service.registrar(body);

    const token = await criarSessao(perfil.usuario);

    return NextResponse.json(
      {
        ...perfil,
        token,
      },
      { status: 201 }
    );

  } catch (e) {
    return respostaDeErro(e);
  }
}
