import { Administrador } from '@/src/model/administrador';
 
export class AdministradorService {
    constructor(repository) {
        this.repository = repository;
    }
 
    async cadastrar(nivelAcesso, usuarioId) {
        if(!nivelAcesso)
            throw new Error("O nível de acesso é obrigatório.");
        if(!usuarioId)
            throw new Error("O usuário é obrigatório.");
        return await this.repository.salvar(new Administrador(nivelAcesso, usuarioId, null));
    }
 
    async listar() {
        return await this.repository.listarTodos();
    }
 
    async buscarPorId(id) {
        const administrador = await this.repository.buscarPorId(id);
        if(!administrador) throw new Error("Administrador não encontrado.");
        return administrador;
    }
 
    async atualizar(id, nivelAcesso, usuarioId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nivelAcesso || !usuarioId)
            throw new Error("Nível de acesso e usuário são obrigatórios.");
 
        await this.buscarPorId(id);
        const administradorAtualizado = new Administrador(nivelAcesso, usuarioId, null, id);
        return await this.repository.atualizar(id, administradorAtualizado);
    }
 
    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}