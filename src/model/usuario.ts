import { Administrador } from "./administrador";
import { Lojista } from "./lojista";
import { Cliente } from "./cliente";

export class Usuario {
    id: number | any;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    tipo: string;
    status: string;
    dataCriacao: Date;

    administradores: Administrador[] = [];
    lojistas: Lojista[] = [];
    clientes: Cliente[] = [];

    constructor(
        nome: string,
        email: string,
        senha: string,
        telefone: string,
        tipo: string,
        status: string,
        dataCriacao: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.telefone = telefone;
        this.tipo = tipo;
        this.status = status;
        this.dataCriacao = dataCriacao;
    }
}