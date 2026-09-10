import { Estoque } from '@/src/model/estoque';

export class EstoqueService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(produtoVariacaoId, quantidade = 0, quantidade_reservada = 0, estoque_minimo = 0) {
        if(!produtoVariacaoId)
            throw new Error("A variação do produto é obrigatória.");
        return await this.repository.salvar(new Estoque(produtoVariacaoId, null, quantidade, quantidade_reservada, estoque_minimo));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const estoque = await this.repository.buscarPorId(id);
        if(!estoque) throw new Error("Estoque não encontrado.");
        return estoque;
    }

    async atualizar(id, produtoVariacaoId, quantidade, quantidade_reservada, estoque_minimo) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!produtoVariacaoId)
            throw new Error("A variação do produto é obrigatória.");

        await this.buscarPorId(id);
        const estoqueAtualizado = new Estoque(produtoVariacaoId, null, quantidade, quantidade_reservada, estoque_minimo, new Date(), id);
        return await this.repository.atualizar(id, estoqueAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}