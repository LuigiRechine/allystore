import { Lojista } from '@/src/model/lojista';

export class LojistaService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(cargo, usuarioId, lojaId) {
        if(!cargo)
            throw new Error("O cargo é obrigatório.");
        if(!usuarioId)
            throw new Error("O usuário é obrigatório.");
        if(!lojaId)
            throw new Error("A loja é obrigatória.");
        return await this.repository.salvar(new Lojista(cargo, usuarioId, lojaId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const lojista = await this.repository.buscarPorId(id);
        if(!lojista) throw new Error("Lojista não encontrado.");
        return lojista;
    }

    async atualizar(id, cargo, usuarioId, lojaId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!cargo || !usuarioId || !lojaId)
            throw new Error("Cargo, usuário e loja são obrigatórios.");

        await this.buscarPorId(id);
        const lojistaAtualizado = new Lojista(cargo, usuarioId, lojaId, null, null, undefined, id);
        return await this.repository.atualizar(id, lojistaAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}