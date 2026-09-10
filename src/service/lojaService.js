import { Loja } from '@/src/model/loja';

export class LojaService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, slug, email, status, logo = null, descricao = null, telefone = null) {
        if(!nome)
            throw new Error("O nome é obrigatório.");
        if(!slug)
            throw new Error("O slug é obrigatório.");
        if(!email)
            throw new Error("O e-mail é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        return await this.repository.salvar(new Loja(nome, slug, email, status, logo, descricao, telefone));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const loja = await this.repository.buscarPorId(id);
        if(!loja) throw new Error("Loja não encontrada.");
        return loja;
    }

    async atualizar(id, nome, slug, email, status, logo = null, descricao = null, telefone = null) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nome || !slug || !email || !status)
            throw new Error("Nome, slug, e-mail e status são obrigatórios.");

        await this.buscarPorId(id);
        const lojaAtualizada = new Loja(nome, slug, email, status, logo, descricao, telefone, undefined, id);
        return await this.repository.atualizar(id, lojaAtualizada);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}