import { Usuario } from '@/src/model/usuario';

export class UsuarioService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, email, senha, telefone, tipo, status) {
        if(!nome)
            throw new Error("O nome é obrigatório.");
        if(!email)
            throw new Error("O e-mail é obrigatório.");
        if(!senha)
            throw new Error("A senha é obrigatória.");
        if(!telefone)
            throw new Error("O telefone é obrigatório.");
        if(!tipo)
            throw new Error("O tipo é obrigatório.");
        if(!status)
            throw new Error("O status é obrigatório.");
        return await this.repository.salvar(new Usuario(nome, email, senha, telefone, tipo, status));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const usuario = await this.repository.buscarPorId(id);
        if(!usuario) throw new Error("Usuário não encontrado.");
        return usuario;
    }

    async atualizar(id, nome, email, senha, telefone, tipo, status) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nome || !email || !senha || !telefone || !tipo || !status)
            throw new Error("Nome, e-mail, senha, telefone, tipo e status são obrigatórios.");

        await this.buscarPorId(id);
        const usuarioAtualizado = new Usuario(nome, email, senha, telefone, tipo, status, undefined, id);
        return await this.repository.atualizar(id, usuarioAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}