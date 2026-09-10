import { ProdutoCarrinho } from '@/src/model/produtoCarrinho';

export class ProdutoCarrinhoService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(quantidade, preco_unitario, carrinhoId, produtoVariacaoId) {
        if(!quantidade)
            throw new Error("A quantidade é obrigatória.");
        if(!preco_unitario)
            throw new Error("O preço unitário é obrigatório.");
        if(!carrinhoId)
            throw new Error("O carrinho é obrigatório.");
        if(!produtoVariacaoId)
            throw new Error("A variação do produto é obrigatória.");
        return await this.repository.salvar(new ProdutoCarrinho(quantidade, preco_unitario, carrinhoId, produtoVariacaoId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const produtoCarrinho = await this.repository.buscarPorId(id);
        if(!produtoCarrinho) throw new Error("Produto do carrinho não encontrado.");
        return produtoCarrinho;
    }

    async atualizar(id, quantidade, preco_unitario, carrinhoId, produtoVariacaoId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!quantidade || !preco_unitario || !carrinhoId || !produtoVariacaoId)
            throw new Error("Quantidade, preço unitário, carrinho e variação do produto são obrigatórios.");

        await this.buscarPorId(id);
        const produtoCarrinhoAtualizado = new ProdutoCarrinho(quantidade, preco_unitario, carrinhoId, produtoVariacaoId, null, null, id);
        return await this.repository.atualizar(id, produtoCarrinhoAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}