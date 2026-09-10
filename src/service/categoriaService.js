import { Categoria } from '@/src/model/categoria';

export class CategoriaService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, status, lojaId, descricao = null) {
        if(!nome)
            throw new Error("O nome é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        if(!lojaId)
            throw new Error("A loja é obrigatória.");
        return await this.repository.salvar(new Categoria(nome, status, lojaId, null, descricao));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const categoria = await this.repository.buscarPorId(id);
        if(!categoria) throw new Error("Categoria não encontrada.");
        return categoria;
    }

    async atualizar(id, nome, status, lojaId, descricao = null) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nome || !status || !lojaId)
            throw new Error("Nome, status e loja são obrigatórios.");

        await this.buscarPorId(id);
        const categoriaAtualizada = new Categoria(nome, status, lojaId, null, descricao, id);
        return await this.repository.atualizar(id, categoriaAtualizada);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}