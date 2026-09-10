import prisma from '@/src/lib/prisma';
import { Cliente } from '@/src/model/cliente';
import { Usuario } from '@/src/model/usuario';
import { Loja } from '@/src/model/loja';

export class ClienteRepository {

    async salvar(obj: Cliente) {
        return await prisma.cliente.create({
            data: {
                nome: obj.nome,
                email: obj.email,
                telefone: obj.telefone,
                cpf: obj.cpf,
                usuarioId: Number(obj.usuarioId),
                lojaId: Number(obj.lojaId)
            },
            include: { usuario: true, loja: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.cliente.findMany({
            include: { usuario: true, loja: true }
        });

        return dados.map(d => new Cliente(
            d.nome,
            d.email,
            d.telefone,
            d.cpf,
            d.usuarioId,
            d.lojaId,
            new Usuario(
                d.usuario.nome, d.usuario.email, d.usuario.senha, d.usuario.telefone,
                d.usuario.tipo, d.usuario.status, d.usuario.dataCriacao, d.usuario.id
            ),
            new Loja(
                d.loja.nome, d.loja.slug, d.loja.email, d.loja.status,
                d.loja.logo, d.loja.descricao, d.loja.telefone, d.loja.dataCriacao, d.loja.id
            ),
            d.dataCadastro,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.cliente.findUnique({
            where: { id: Number(id) },
            include: { usuario: true, loja: true }
        });

        if (!dado) return null;

        return new Cliente(
            dado.nome,
            dado.email,
            dado.telefone,
            dado.cpf,
            dado.usuarioId,
            dado.lojaId,
            new Usuario(
                dado.usuario.nome, dado.usuario.email, dado.usuario.senha, dado.usuario.telefone,
                dado.usuario.tipo, dado.usuario.status, dado.usuario.dataCriacao, dado.usuario.id
            ),
            new Loja(
                dado.loja.nome, dado.loja.slug, dado.loja.email, dado.loja.status,
                dado.loja.logo, dado.loja.descricao, dado.loja.telefone, dado.loja.dataCriacao, dado.loja.id
            ),
            dado.dataCadastro,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Cliente) {
        return await prisma.cliente.update({
            where: { id: Number(id) },
            data: {
                nome: obj.nome,
                email: obj.email,
                telefone: obj.telefone,
                cpf: obj.cpf,
                usuarioId: Number(obj.usuarioId),
                lojaId: Number(obj.lojaId)
            },
            include: { usuario: true, loja: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.cliente.delete({
            where: { id: Number(id) }
        });
    }
}