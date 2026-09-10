import { Pedido } from '@/src/model/pedido';

export class PedidoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(status, clienteId, lojaId) {
        if(!status)
            throw new Error("O status é obrigatório.");
        if(!clienteId)
            throw new Error("O cliente é obrigatório.");
        if(!lojaId)
            throw new Error("A loja é obrigatória.");
        return await this.repository.salvar(new Pedido(status, clienteId, lojaId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const pedido = await this.repository.buscarPorId(id);
        if(!pedido) throw new Error("Pedido não encontrado.");
        return pedido;
    }

    async atualizar(id, status, clienteId, lojaId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!status || !clienteId || !lojaId)
            throw new Error("Status, cliente e loja são obrigatórios.");

        await this.buscarPorId(id);
        const pedidoAtualizado = new Pedido(status, clienteId, lojaId, null, null, undefined, id);
        return await this.repository.atualizar(id, pedidoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}