import { Carrinho } from "./carrinho";
import { ProdutoVariacao } from "./produtoVariacao";

export class ProdutoCarrinho {
    id: number | any;
    quantidade: number;
    preco_unitario: any;

    carrinhoId: number | any;
    produtoVariacaoId: number | any;

    carrinho? : Carrinho | null;
    produtoVariacao? : ProdutoVariacao | null;

    constructor(
        quantidade: number,
        preco_unitario: any,
        carrinhoId: number | any,
        produtoVariacaoId: number | any,
        carrinho: Carrinho | null,
        produtoVariacao: ProdutoVariacao | null,
        id: number | any = null
    ) {
        this.id = id;
        this.quantidade = quantidade;
        this.preco_unitario = preco_unitario;
        this.carrinhoId = carrinhoId;
        this.produtoVariacaoId = produtoVariacaoId;
        this.carrinho = carrinho;
        this.produtoVariacao = produtoVariacao;
    }
}