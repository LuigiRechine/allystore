export class Loja {
    id: bigint | any;
    nome: String;
    slug: String;
    logo: String | null;
    descricao: String | null;
    email: String;
    telefone: String | null;
    status: String;
    dataCriacao: Date;

    /*
        relacionamentos
        lojistas: Lojista[] = [];
        clientes: Cliente[] = [];
        categorias: Categoria[] = [];
        produtos: Produto[] = [];
        pedidos: Pedido[] = [];
        carrinhos: Carrinho[] = [];
    */

    constructor(
        nome: String,
        slug: String,
        email: String,
        status: String,
        logo: String | null = null,
        descricao: String | null = null,
        telefone: String | null = null,
        dataCriacao: Date = new Date(),
        id: bigint | any = null
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