import { Cliente } from '@/src/model/cliente';

export class ClienteService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, email, telefone, cpf, usuarioId, lojaId) {
        if(!nome)
            throw new Error("O nome é obrigatório.");
        if(!email)
            throw new Error("O e-mail é obrigatório.");
        if(!telefone)
            throw new Error("O telefone é obrigatório.");
        if(!cpf)
            throw new Error("O CPF é obrigatório.");
        if(!usuarioId)
            throw new Error("O usuário é obrigatório.");
        if(!lojaId)
            throw new Error("A loja é obrigatória.");
        return await this.repository.salvar(new Cliente(nome, email, telefone, cpf, usuarioId, lojaId, null, null));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const cliente = await this.repository.buscarPorId(id);
        if(!cliente) throw new Error("Cliente não encontrado.");
        return cliente;
    }

    async atualizar(id, nome, email, telefone, cpf, usuarioId, lojaId) {
        if(!id)
            throw new Error("ID é obrigatório para atualização.");
        if(!nome || !email || !telefone || !cpf || !usuarioId || !lojaId)
            throw new Error("Nome, e-mail, telefone, CPF, usuário e loja são obrigatórios.");

        await this.buscarPorId(id);
        const clienteAtualizado = new Cliente(nome, email, telefone, cpf, usuarioId, lojaId, null, null, undefined, id);
        return await this.repository.atualizar(id, clienteAtualizado);
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}