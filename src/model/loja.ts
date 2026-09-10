import { Lojista } from "./lojista";
import { Cliente } from "./cliente";
import { Categoria } from "./categoria";
import { Produto } from "./produto";
import { Pedido } from "./pedido";
import { Carrinho } from "./carrinho";

export class Loja {
    id: number | any;
    nome: string;
    slug: string;
    logo: string | null;
    descricao: string | null;
    email: string;
    telefone: string | null;
    status: string;
    dataCriacao: Date;



    lojistas: Lojista[] = [];
    clientes: Cliente[] = [];
    categorias: Categoria[] = [];
    produtos: Produto[] = [];
    pedidos: Pedido[] = [];
    carrinhos: Carrinho[] = [];


    constructor(
        nome: string,
        slug: string,
        email: string,
        status: string,
        logo: string | null = null,
        descricao: string | null = null,
        telefone: string | null = null,
        dataCriacao: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.slug = slug;
        this.logo = logo;
        this.descricao = descricao;
        this.email = email;
        this.telefone = telefone;
        this.status = status;
        this.dataCriacao = dataCriacao;

    }
}