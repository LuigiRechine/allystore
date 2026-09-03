import { Loja, ProdutoCarrinho, Cliente } from "@prisma/client";
export class Carrinho {
    id: bigint | any;
    status: string;
    dataCriacao: Date;
    data_atualizacao: Date;

    clienteId: bigint | any;
    lojaId: bigint | any;

    cliente?: Cliente;
    loja?: Loja;
    produtosCarrinho?: ProdutoCarrinho[];

    constructor(
        status: string,
        clienteId: bigint | any,
        lojaId: bigint | any,
        dataCriacao: Date,
        data_atualizacao: Date,
        cliente?: Cliente,
        loja?: Loja,
        produtosCarrinho: ProdutoCarrinho[] = [],
        id: bigint | any = null
    ) {
        this.id = id;
        this.status = status;
        this.dataCriacao = dataCriacao;
        this.data_atualizacao = data_atualizacao;
        this.clienteId = clienteId;
        this.lojaId = lojaId;
        this.cliente = cliente;
        this.loja = loja;
        this.produtosCarrinho = produtosCarrinho;
    }
}