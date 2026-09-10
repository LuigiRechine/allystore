import prisma from '@/src/lib/prisma';
import { Pagamento } from '@/src/model/pagamento';
import { Pedido } from '@/src/model/pedido';

export class PagamentoRepository {

    async salvar(obj: Pagamento) {
        return await prisma.pagamento.create({
            data: {
                valor: obj.valor,
                metodo: obj.metodo,
                status: obj.status,
                codigoTransacao: obj.codigoTransacao,
                pedidoId: Number(obj.pedidoId)
            },
            include: { pedido: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.pagamento.findMany({
            include: { pedido: true }
        });

        return dados.map(d => new Pagamento(
            d.valor,
            d.metodo,
            d.status,
            d.codigoTransacao,
            d.pedidoId,
            new Pedido(
                d.pedido.status, d.pedido.clienteId, d.pedido.lojaId,
                null, null, d.pedido.data, d.pedido.id
            ),
            d.dataPagamento,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.pagamento.findUnique({
            where: { id: Number(id) },
            include: { pedido: true }
        });

        if (!dado) return null;

        return new Pagamento(
            dado.valor,
            dado.metodo,
            dado.status,
            dado.codigoTransacao,
            dado.pedidoId,
            new Pedido(
                dado.pedido.status, dado.pedido.clienteId, dado.pedido.lojaId,
                null, null, dado.pedido.data, dado.pedido.id
            ),
            dado.dataPagamento,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Pagamento) {
        return await prisma.pagamento.update({
            where: { id: Number(id) },
            data: {
                valor: obj.valor,
                metodo: obj.metodo,
                status: obj.status,
                codigoTransacao: obj.codigoTransacao,
                pedidoId: Number(obj.pedidoId)
            },
            include: { pedido: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.pagamento.delete({
            where: { id: Number(id) }
        });
    }
}