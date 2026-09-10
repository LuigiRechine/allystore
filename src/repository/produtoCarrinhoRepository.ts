import prisma from '@/src/lib/prisma';
import { ProdutoCarrinho } from '@/src/model/produtoCarrinho';
import { Carrinho } from '@/src/model/carrinho';
import { ProdutoVariacao } from '@/src/model/produtoVariacao';

export class ProdutoCarrinhoRepository {

    async salvar(obj: ProdutoCarrinho) {
        return await prisma.produtoCarrinho.create({
            data: {
                quantidade: obj.quantidade,
                preco_unitario: obj.preco_unitario,
                carrinhoId: Number(obj.carrinhoId),
                produtoVariacaoId: Number(obj.produtoVariacaoId)
            },
            include: { carrinho: true, produtoVariacao: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.produtoCarrinho.findMany({
            include: { carrinho: true, produtoVariacao: true }
        });

        return dados.map(d => new ProdutoCarrinho(
            d.quantidade,
            d.preco_unitario,
            d.carrinhoId,
            d.produtoVariacaoId,
            new Carrinho(
                d.carrinho.status, d.carrinho.clienteId, d.carrinho.lojaId,
                null, null, d.carrinho.dataCriacao, d.carrinho.data_atualizacao, d.carrinho.id
            ),
            new ProdutoVariacao(
                d.produtoVariacao.sku, d.produtoVariacao.cor, d.produtoVariacao.tamanho,
                d.produtoVariacao.preco, d.produtoVariacao.status, d.produtoVariacao.produtoId,
                null, d.produtoVariacao.id
            ),
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.produtoCarrinho.findUnique({
            where: { id: Number(id) },
            include: { carrinho: true, produtoVariacao: true }
        });

        if (!dado) return null;

        return new ProdutoCarrinho(
            dado.quantidade,
            dado.preco_unitario,
            dado.carrinhoId,
            dado.produtoVariacaoId,
            new Carrinho(
                dado.carrinho.status, dado.carrinho.clienteId, dado.carrinho.lojaId,
                null, null, dado.carrinho.dataCriacao, dado.carrinho.data_atualizacao, dado.carrinho.id
            ),
            new ProdutoVariacao(
                dado.produtoVariacao.sku, dado.produtoVariacao.cor, dado.produtoVariacao.tamanho,
                dado.produtoVariacao.preco, dado.produtoVariacao.status, dado.produtoVariacao.produtoId,
                null, dado.produtoVariacao.id
            ),
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: ProdutoCarrinho) {
        return await prisma.produtoCarrinho.update({
            where: { id: Number(id) },
            data: {
                quantidade: obj.quantidade,
                preco_unitario: obj.preco_unitario,
                carrinhoId: Number(obj.carrinhoId),
                produtoVariacaoId: Number(obj.produtoVariacaoId)
            },
            include: { carrinho: true, produtoVariacao: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.produtoCarrinho.delete({
            where: { id: Number(id) }
        });
    }
}