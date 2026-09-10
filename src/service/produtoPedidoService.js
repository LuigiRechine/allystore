import { ProdutoPedido } from '@/src/model/produtoPedido';

export class ProdutoPedidoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(quantidade, preco_unitario, subtotal, pedidoId, produtoId) {
        if(!quantidade)
            throw new Error("A quantidade é obrigatória.");
        if(!preco_unitario)
            throw new Error("O preço unitário é obrigatório.");
        if(!subtotal)
            throw new Error("O subtotal é obrigatório.");
        if(!pedidoId)
            throw new Error("O pedido é obrigatório.");
        if(!produtoId)
            throw new Error("O produto é obrigatório.");
        return await this.repository.salvar(new ProdutoPedido(quantidade, preco_unitario, subtotal, pedidoId, produtoId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const produtoPedido = await this.repository.buscarPorId(id);
        if(!produtoPedido) throw new Error("Produto do pedido não encontrado.");
        return produtoPedido;
    }

    async atualizar(id, quantidade, preco_unitario, subtotal, pedidoId, produtoId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!quantidade || !preco_unitario || !subtotal || !pedidoId || !produtoId)
            throw new Error("Quantidade, preço unitário, subtotal, pedido e produto são obrigatórios.");

        await this.buscarPorId(id);
        const produtoPedidoAtualizado = new ProdutoPedido(quantidade, preco_unitario, subtotal, pedidoId, produtoId, null, null, id);
        return await this.repository.atualizar(id, produtoPedidoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}