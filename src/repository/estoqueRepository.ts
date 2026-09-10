import prisma from '@/src/lib/prisma';
import { Estoque } from '@/src/model/estoque';
import { ProdutoVariacao } from '@/src/model/produtoVariacao';

export class EstoqueRepository {

    async salvar(obj: Estoque) {
        return await prisma.estoque.create({
            data: {
                quantidade: obj.quantidade,
                quantidade_reservada: obj.quantidade_reservada,
                estoque_minimo: obj.estoque_minimo,
                produtoVariacaoId: Number(obj.produtoVariacaoId)
            },
            include: { produtoVariacao: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.estoque.findMany({
            include: { produtoVariacao: true }
        });

        return dados.map(d => new Estoque(
            d.produtoVariacaoId,
            new ProdutoVariacao(
                d.produtoVariacao.sku, d.produtoVariacao.cor, d.produtoVariacao.tamanho,
                d.produtoVariacao.preco, d.produtoVariacao.status, d.produtoVariacao.produtoId,
                null, d.produtoVariacao.id
            ),
            d.quantidade,
            d.quantidade_reservada,
            d.estoque_minimo,
            d.data_atualizacao,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.estoque.findUnique({
            where: { id: Number(id) },
            include: { produtoVariacao: true }
        });

        if (!dado) return null;

        return new Estoque(
            dado.produtoVariacaoId,
            new ProdutoVariacao(
                dado.produtoVariacao.sku, dado.produtoVariacao.cor, dado.produtoVariacao.tamanho,
                dado.produtoVariacao.preco, dado.produtoVariacao.status, dado.produtoVariacao.produtoId,
                null, dado.produtoVariacao.id
            ),
            dado.quantidade,
            dado.quantidade_reservada,
            dado.estoque_minimo,
            dado.data_atualizacao,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Estoque) {
        return await prisma.estoque.update({
            where: { id: Number(id) },
            data: {
                quantidade: obj.quantidade,
                quantidade_reservada: obj.quantidade_reservada,
                estoque_minimo: obj.estoque_minimo,
                produtoVariacaoId: Number(obj.produtoVariacaoId),
                data_atualizacao: new Date()
            },
            include: { produtoVariacao: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.estoque.delete({
            where: { id: Number(id) }
        });
    }
}