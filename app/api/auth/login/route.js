import { NextResponse } from 'next/server';
import { UsuarioRepository } from '@/src/repository/usuarioRepository';

// POST /api/auth/login  { email, senha }
//
// Mantém o padrão do projeto (usa o repository, não o prisma direto).
// Retorna o usuário sem a senha.
//
// IMPORTANTE: enquanto as senhas estiverem em texto puro no banco, a
// comparação abaixo é direta. Quando aplicar hash (bcrypt/argon2) no
// UsuarioService.cadastrar, troque a comparação por bcrypt.compare.

const repository = new UsuarioRepository();

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body.email || !body.senha) {
            return NextResponse.json({ erro: 'E-mail e senha são obrigatórios.' }, { status: 400 });
        }

        const usuarios = await repository.listarTodos();
        const usuario = usuarios.find(
            u => u.email?.toLowerCase() === String(body.email).toLowerCase() && u.senha === body.senha
        );

        if (!usuario) {
            return NextResponse.json({ erro: 'E-mail ou senha inválidos.' }, { status: 401 });
        }

        if (usuario.status !== 'ativo') {
            return NextResponse.json({ erro: 'Esta conta está inativa.' }, { status: 403 });
        }

        const { senha, ...semSenha } = usuario;
        return NextResponse.json(semSenha, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500 });
    }
}
