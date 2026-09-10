import { Cliente } from "./cliente";
import { Loja } from "./loja";
import { ProdutoCarrinho } from "./produtoCarrinho";

export class Carrinho {
    id: number | any;
    status: string;
    dataCriacao: Date;
    data_atualizacao: Date;

    clienteId: number | any;
    lojaId: number | any;

    cliente?: Cliente | null;
    loja?: Loja | null;

    produtosCarrinho: ProdutoCarrinho[] = [];

    constructor(
        status: string,
        clienteId: number | any,
        lojaId: number | any,
        cliente: Cliente | null,
        loja: Loja | null,
        dataCriacao: Date = new Date(),
        data_atualizacao: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.status = status;
        this.dataCriacao = dataCriacao;
        this.data_atualizacao = data_atualizacao;
        this.clienteId = clienteId;
        this.lojaId = lojaId;
        this.cliente = cliente;
        this.loja = loja;
    }
}