import { Produto } from '@/src/model/produto';

export class ProdutoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, descricao, preco, status, categoriaId, lojaId, destaque = true) {
        if(!nome)
            throw new Error("O nome é obrigatório.");
        if(!descricao)
            throw new Error("A descrição é obrigatória.");
        if(!preco)
            throw new Error("O preço é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        if(!categoriaId)
            throw new Error("A categoria é obrigatória.");
        if(!lojaId)
            throw new Error("A loja é obrigatória.");
        return await this.repository.salvar(new Produto(nome, descricao, preco, status, categoriaId, lojaId, null, null, destaque));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const produto = await this.repository.buscarPorId(id);
        if(!produto) throw new Error("Produto não encontrado.");
        return produto;
    }

    async atualizar(id, nome, descricao, preco, status, categoriaId, lojaId, destaque) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nome || !descricao || !preco || !status || !categoriaId || !lojaId)
            throw new Error("Nome, descrição, preço, status, categoria e loja são obrigatórios.");

        await this.buscarPorId(id);
        const produtoAtualizado = new Produto(nome, descricao, preco, status, categoriaId, lojaId, null, null, destaque, id);
        return await this.repository.atualizar(id, produtoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}