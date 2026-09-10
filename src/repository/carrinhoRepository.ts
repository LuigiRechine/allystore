import prisma from '@/src/lib/prisma';
import { Carrinho } from '@/src/model/carrinho';
import { Cliente } from '@/src/model/cliente';
import { Loja } from '@/src/model/loja';

export class CarrinhoRepository {

    async salvar(obj: Carrinho) {
        return await prisma.carrinho.create({
            data: {
                status: obj.status,
                clienteId: Number(obj.clienteId),
                lojaId: Number(obj.lojaId)
            },
            include: { cliente: true, loja: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.carrinho.findMany({
            include: { cliente: true, loja: true }
        });

        return dados.map(d => new Carrinho(
            d.status,
            d.clienteId,
            d.lojaId,
            new Cliente(
                d.cliente.nome, d.cliente.email, d.cliente.telefone, d.cliente.cpf,
                d.cliente.usuarioId, d.cliente.lojaId, null, null, d.cliente.dataCadastro, d.cliente.id
            ),
            new Loja(
                d.loja.nome, d.loja.slug, d.loja.email, d.loja.status,
                d.loja.logo, d.loja.descricao, d.loja.telefone, d.loja.dataCriacao, d.loja.id
            ),
            d.dataCriacao,
            d.data_atualizacao,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.carrinho.findUnique({
            where: { id: Number(id) },
            include: { cliente: true, loja: true }
        });

        if (!dado) return null;

        return new Carrinho(
            dado.status,
            dado.clienteId,
            dado.lojaId,
            new Cliente(
                dado.cliente.nome, dado.cliente.email, dado.cliente.telefone, dado.cliente.cpf,
                dado.cliente.usuarioId, dado.cliente.lojaId, null, null, dado.cliente.dataCadastro, dado.cliente.id
            ),
            new Loja(
                dado.loja.nome, dado.loja.slug, dado.loja.email, dado.loja.status,
                dado.loja.logo, dado.loja.descricao, dado.loja.telefone, dado.loja.dataCriacao, dado.loja.id
            ),
            dado.dataCriacao,
            dado.data_atualizacao,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Carrinho) {
        return await prisma.carrinho.update({
            where: { id: Number(id) },
            data: {
                status: obj.status,
                clienteId: Number(obj.clienteId),
                lojaId: Number(obj.lojaId),
                data_atualizacao: new Date()
            },
            include: { cliente: true, loja: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.carrinho.delete({
            where: { id: Number(id) }
        });
    }
}