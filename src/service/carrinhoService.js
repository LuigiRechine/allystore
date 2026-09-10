import { Carrinho } from '@/src/model/carrinho';

export class CarrinhoService {
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
        return await this.repository.salvar(new Carrinho(status, clienteId, lojaId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const carrinho = await this.repository.buscarPorId(id);
        if(!carrinho) throw new Error("Carrinho não encontrado.");
        return carrinho;
    }

    async atualizar(id, status, clienteId, lojaId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!status || !clienteId || !lojaId)
            throw new Error("Status, cliente e loja são obrigatórios.");

        await this.buscarPorId(id);
        const carrinhoAtualizado = new Carrinho(status, clienteId, lojaId, null, null, new Date(), new Date(), id);
        return await this.repository.atualizar(id, carrinhoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}