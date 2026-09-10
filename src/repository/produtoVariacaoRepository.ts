import prisma from '@/src/lib/prisma';
import { ProdutoVariacao } from '@/src/model/produtoVariacao';
import { Produto } from '@/src/model/produto';

export class ProdutoVariacaoRepository {

    async salvar(obj: ProdutoVariacao) {
        return await prisma.produtoVariacao.create({
            data: {
                sku: obj.sku,
                cor: obj.cor,
                tamanho: obj.tamanho,
                preco: obj.preco,
                status: obj.status,
                produtoId: Number(obj.produtoId)
            },
            include: { produto: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.produtoVariacao.findMany({
            include: { produto: true }
        });

        return dados.map(d => new ProdutoVariacao(
            d.sku,
            d.cor,
            d.tamanho,
            d.preco,
            d.status,
            d.produtoId,
            new Produto(
                d.produto.nome, d.produto.descricao, d.produto.preco, d.produto.status,
                d.produto.categoriaId, d.produto.lojaId, null, null, d.produto.destaque, d.produto.id
            ),
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.produtoVariacao.findUnique({
            where: { id: Number(id) },
            include: { produto: true }
        });

        if (!dado) return null;

        return new ProdutoVariacao(
            dado.sku,
            dado.cor,
            dado.tamanho,
            dado.preco,
            dado.status,
            dado.produtoId,
            new Produto(
                dado.produto.nome, dado.produto.descricao, dado.produto.preco, dado.produto.status,
                dado.produto.categoriaId, dado.produto.lojaId, null, null, dado.produto.destaque, dado.produto.id
            ),
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: ProdutoVariacao) {
        return await prisma.produtoVariacao.update({
            where: { id: Number(id) },
            data: {
                sku: obj.sku,
                cor: obj.cor,
                tamanho: obj.tamanho,
                preco: obj.preco,
                status: obj.status,
                produtoId: Number(obj.produtoId)
            },
            include: { produto: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.produtoVariacao.delete({
            where: { id: Number(id) }
        });
    }
}