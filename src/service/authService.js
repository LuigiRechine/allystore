import bcrypt from 'bcryptjs';
import prisma, { prismaComSenha } from '@/src/lib/prisma';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Gasta o mesmo tempo quando o e-mail não existe (evita descobrir e-mails pelo tempo de resposta)
const HASH_FALSO = bcrypt.hashSync('senha-falsa', 10);

export class ErroAuth extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem);
        this.name = 'ErroAuth';
        this.status = status;
    }
}

export class AuthService {

    async login(email, senha) {
        if (!email || !senha) throw new ErroAuth('E-mail e senha são obrigatórios.');

        const usuario = await prismaComSenha.usuario.findUnique({
            where: { email: String(email).trim().toLowerCase() },
        });
        const confere = await bcrypt.compare(String(senha), usuario?.senha ?? HASH_FALSO);

        if (!usuario || !confere) throw new ErroAuth('E-mail ou senha inválidos.', 401);
        if (usuario.status !== 'ativo') throw new ErroAuth('Esta conta está inativa.', 403);

        return this.montarPerfil(usuario.id);
    }

    // Dados que a tela precisa logo após entrar (sem senha: o prisma "seguro" remove).
    async montarPerfil(usuarioId) {
        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
        if (!usuario) return null;

        const perfil = { usuario };
        if (usuario.tipo === 'lojista') {
            const vinculo = await prisma.lojista.findFirst({ where: { usuarioId }, include: { loja: true } });
            if (vinculo) {
                const { loja, ...lojista } = vinculo;
                perfil.lojista = lojista;
                perfil.loja = loja;
            }
        }
        if (usuario.tipo === 'cliente') {
            perfil.clientes = await prisma.cliente.findMany({ where: { usuarioId } });
        }
        return perfil;
    }

    async registrar(d) {
        const nome = String(d.nome ?? '').trim();
        const email = String(d.email ?? '').trim().toLowerCase();
        const senha = String(d.senha ?? '');
        const telefone = String(d.telefone ?? '').trim();

        if (!nome || !telefone) throw new ErroAuth('Nome e telefone são obrigatórios.');
        if (!EMAIL.test(email)) throw new ErroAuth('E-mail inválido.');
        if (senha.length < 8) throw new ErroAuth('A senha precisa ter ao menos 8 caracteres.');

        if (d.tipo === 'cliente') return this.registrarCliente({ nome, email, senha, telefone, cpf: d.cpf, lojaId: d.lojaId });
        if (d.tipo === 'lojista') return this.registrarLojista({ nome, email, senha, telefone, loja: d.loja });
        throw new ErroAuth('Tipo de conta inválido.'); // admin NUNCA é criado por aqui
    }

    async registrarCliente({ nome, email, senha, telefone, cpf, lojaId }) {
        if (!cpf) throw new ErroAuth('O CPF é obrigatório.');

        const loja = await prisma.loja.findUnique({ where: { id: Number(lojaId) } });
        if (!loja || loja.status !== 'ativo') throw new ErroAuth('Loja não encontrada.', 404);

        const existente = await prismaComSenha.usuario.findUnique({ where: { email } });

        // Mesmo e-mail já é cliente de outra loja: confirma a senha e só vincula a esta loja.
        if (existente) {
            const confere = existente.tipo === 'cliente' && await bcrypt.compare(senha, existente.senha);
            if (!confere) throw new ErroAuth('E-mail já cadastrado.', 409);
            const jaTem = await prisma.cliente.findFirst({ where: { usuarioId: existente.id, lojaId: loja.id } });
            if (jaTem) throw new ErroAuth('Você já tem cadastro nesta loja. Faça login.', 409);
        }

        const usuarioId = await prisma.$transaction(async (tx) => {
            const id = existente
                ? existente.id
                : (await tx.usuario.create({
                    data: { nome, email, senha: await bcrypt.hash(senha, 10), telefone, tipo: 'cliente', status: 'ativo' },
                })).id;
            await tx.cliente.create({ data: { nome, email, telefone, cpf: String(cpf), usuarioId: id, lojaId: loja.id } });
            return id;
        });

        return this.montarPerfil(usuarioId);
    }

    async registrarLojista({ nome, email, senha, telefone, loja }) {
        if (!loja?.nome || !loja?.slug) throw new ErroAuth('Nome e endereço da loja são obrigatórios.');

        const slug = String(loja.slug).trim().toLowerCase();
        if (!SLUG.test(slug)) throw new ErroAuth('Endereço da loja inválido (use letras minúsculas, números e hífen).');
        if (await prismaComSenha.usuario.findUnique({ where: { email } })) throw new ErroAuth('E-mail já cadastrado.', 409);
        if (await prisma.loja.findUnique({ where: { slug } })) throw new ErroAuth('Esse endereço de loja já está em uso.', 409);

        const usuarioId = await prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: { nome, email, senha: await bcrypt.hash(senha, 10), telefone, tipo: 'lojista', status: 'ativo' },
            });
            const novaLoja = await tx.loja.create({
                data: {
                    nome: String(loja.nome).trim(), slug,
                    email: loja.email || email, telefone: loja.telefone || telefone,
                    logo: loja.logo || null, descricao: loja.descricao || null, status: 'ativo',
                },
            });
            await tx.lojista.create({ data: { cargo: 'proprietario', usuarioId: usuario.id, lojaId: novaLoja.id } });
            return usuario.id;
        });

        return this.montarPerfil(usuarioId);
    }

    async alterarSenha(usuarioId, atual, nova) {
        if (!atual || !nova) throw new ErroAuth('Informe a senha atual e a nova.');
        if (String(nova).length < 8) throw new ErroAuth('A nova senha precisa ter ao menos 8 caracteres.');

        const usuario = await prismaComSenha.usuario.findUnique({ where: { id: usuarioId } });
        if (!usuario || !(await bcrypt.compare(String(atual), usuario.senha))) {
            throw new ErroAuth('Senha atual incorreta.', 401);
        }
        await prismaComSenha.usuario.update({
            where: { id: usuarioId },
            data: { senha: await bcrypt.hash(String(nova), 10) },
        });
    }
}