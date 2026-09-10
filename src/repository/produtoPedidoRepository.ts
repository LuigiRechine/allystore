import prisma from '@/src/lib/prisma';
import { ProdutoPedido } from '@/src/model/produtoPedido';
import { Pedido } from '@/src/model/pedido';
import { Produto } from '@/src/model/produto';

export class ProdutoPedidoRepository {

    async salvar(obj: ProdutoPedido) {
        return await prisma.produtoPedido.create({
            data: {
                quantidade: obj.quantidade,
                preco_unitario: obj.preco_unitario,
                subtotal: obj.subtotal,
                pedidoId: Number(obj.pedidoId),
                produtoId: Number(obj.produtoId)
            },
            include: { pedido: true, produto: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.produtoPedido.findMany({
            include: { pedido: true, produto: true }
        });

        return dados.map(d => new ProdutoPedido(
            d.quantidade,
            d.preco_unitario,
            d.subtotal,
            d.pedidoId,
            d.produtoId,
            new Pedido(
                d.pedido.status, d.pedido.clienteId, d.pedido.lojaId,
                null, null, d.pedido.data, d.pedido.id
            ),
            new Produto(
                d.produto.nome, d.produto.descricao, d.produto.preco, d.produto.status,
                d.produto.categoriaId, d.produto.lojaId, null, null, d.produto.destaque, d.produto.id
            ),
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.produtoPedido.findUnique({
            where: { id: Number(id) },
            include: { pedido: true, produto: true }
        });

        if (!dado) return null;

        return new ProdutoPedido(
            dado.quantidade,
            dado.preco_unitario,
            dado.subtotal,
            dado.pedidoId,
            dado.produtoId,
            new Pedido(
                dado.pedido.status, dado.pedido.clienteId, dado.pedido.lojaId,
                null, null, dado.pedido.data, dado.pedido.id
            ),
            new Produto(
                dado.produto.nome, dado.produto.descricao, dado.produto.preco, dado.produto.status,
                dado.produto.categoriaId, dado.produto.lojaId, null, null, dado.produto.destaque, dado.produto.id
            ),
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: ProdutoPedido) {
        return await prisma.produtoPedido.update({
            where: { id: Number(id) },
            data: {
                quantidade: obj.quantidade,
                preco_unitario: obj.preco_unitario,
                subtotal: obj.subtotal,
                pedidoId: Number(obj.pedidoId),
                produtoId: Number(obj.produtoId)
            },
            include: { pedido: true, produto: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.produtoPedido.delete({
            where: { id: Number(id) }
        });
    }
}