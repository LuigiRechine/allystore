import { ProdutoVariacao } from '@/src/model/produtoVariacao';

export class ProdutoVariacaoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(sku, cor, tamanho, preco, status, produtoId) {
        if(!sku)
            throw new Error("O SKU é obrigatório.");
        if(!cor)
            throw new Error("A cor é obrigatória.");
        if(!tamanho)
            throw new Error("O tamanho é obrigatório.");
        if(!preco)
            throw new Error("O preço é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        if(!produtoId)
            throw new Error("O produto é obrigatório.");
        return await this.repository.salvar(new ProdutoVariacao(sku, cor, tamanho, preco, status, produtoId));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const produtoVariacao = await this.repository.buscarPorId(id);
        if(!produtoVariacao) throw new Error("Variação do produto não encontrada.");
        return produtoVariacao;
    }

    async atualizar(id, sku, cor, tamanho, preco, status, produtoId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!sku || !cor || !tamanho || !preco || !status || !produtoId)
            throw new Error("SKU, cor, tamanho, preço, status e produto são obrigatórios.");

        await this.buscarPorId(id);
        const produtoVariacaoAtualizada = new ProdutoVariacao(sku, cor, tamanho, preco, status, produtoId, null, id);
        return await this.repository.atualizar(id, produtoVariacaoAtualizada);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}