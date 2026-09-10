import { Produto } from "./produto";
import { Estoque } from "./estoque";
import { ProdutoCarrinho } from "./produtoCarrinho";

export class ProdutoVariacao {
    id: number | any;
    sku: string;
    cor: string;
    tamanho: string;
    preco: any;
    status: string;

    produtoId: number | any;

    produto? : Produto | null;

    estoques: Estoque[] = [];
    produtosCarrinho: ProdutoCarrinho[] = [];

    constructor(
        sku: string,
        cor: string,
        tamanho: string,
        preco: any,
        status: string,
        produtoId: number | any,
        produto: Produto | null,
        id: number | any = null
    ) {
        this.id = id;
        this.sku = sku;
        this.cor = cor;
        this.tamanho = tamanho;
        this.preco = preco;
        this.status = status;
        this.produtoId = produtoId;
        this.produto = produto;
    }
}