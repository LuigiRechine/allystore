import bcrypt from 'bcryptjs';
import { Usuario } from '@/src/model/usuario';

const TIPOS = ['admin', 'lojista', 'cliente'];
const STATUS = ['ativo', 'inativo'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UsuarioService {
    constructor(repository) {
        this.repository = repository;
    }

    async cadastrar(nome, email, senha, telefone, tipo, status) {
        if (!nome) throw new Error("O nome é obrigatório.");
        if (!email || !EMAIL.test(email)) throw new Error("Informe um e-mail válido.");
        if (!senha || senha.length < 8) throw new Error("A senha precisa ter ao menos 8 caracteres.");
        if (!telefone) throw new Error("O telefone é obrigatório.");
        if (!TIPOS.includes(tipo)) throw new Error("Tipo inválido.");
        if (!STATUS.includes(status)) throw new Error("Status inválido.");

        email = email.trim().toLowerCase();
        if (await this.repository.buscarPorEmail(email)) throw new Error("E-mail já cadastrado.");

        const hash = await bcrypt.hash(senha, 10);
        return await this.repository.salvar(new Usuario(nome, email, hash, telefone, tipo, status));
    }

    async listar() {
        return await this.repository.listarTodos();
    }

    async buscarPorId(id) {
        const usuario = await this.repository.buscarPorId(id);
        if (!usuario) throw new Error("Usuário não encontrado.");
        return usuario;
    }

    // `admin` vem da sessão (rota). Quem não é admin NÃO consegue mudar tipo/status.
    async atualizar(id, nome, email, senha, telefone, tipo, status, { admin = false } = {}) {
        if (!id) throw new Error("ID é obrigatório para atualização.");
        if (!nome || !email || !telefone) throw new Error("Nome, e-mail e telefone são obrigatórios.");
        if (!EMAIL.test(email)) throw new Error("Informe um e-mail válido.");
        if (senha && senha.length < 8) throw new Error("A senha precisa ter ao menos 8 caracteres.");

        const atual = await this.buscarPorId(id);
        email = email.trim().toLowerCase();
        if (email !== atual.email) {
            if (await this.repository.buscarPorEmail(email)) throw new Error("E-mail já cadastrado.");
        }

        const novoTipo = admin && TIPOS.includes(tipo) ? tipo : atual.tipo;
        const novoStatus = admin && STATUS.includes(status) ? status : atual.status;
        const hash = senha ? await bcrypt.hash(senha, 10) : undefined; // sem senha = mantém a atual

        return await this.repository.atualizar(id, new Usuario(nome, email, hash, telefone, novoTipo, novoStatus, undefined, id));
    }

    async excluir(id) {
        await this.buscarPorId(id);
        return await this.repository.excluir(id);
    }
}