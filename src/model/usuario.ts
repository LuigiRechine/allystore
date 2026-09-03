export class Usuario {
    id: bigint | any;
    nome: String;
    email: String;
    senha: String;
    telefone: String;
    tipo: String;
    status: String;
    dataCriacao: Date;

    constructor(
        nome: String,
        email: String,
        senha: String,
        telefone: String,
        tipo: String,
        status: String,
        dataCriacao: Date = new Date(),
        id: bigint | any = null
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