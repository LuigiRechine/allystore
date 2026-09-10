import { ProdutoVariacao } from "./produtoVariacao";

export class Estoque {
    id: number | any;
    quantidade: number;
    quantidade_reservada: number;
    estoque_minimo: number;
    data_atualizacao: Date;

    produtoVariacaoId: number | any;

    produtoVariacao? : ProdutoVariacao | null;

    constructor(
        produtoVariacaoId: number | any,
        produtoVariacao: ProdutoVariacao | null,
        quantidade: number = 0,
        quantidade_reservada: number = 0,
        estoque_minimo: number = 0,
        data_atualizacao: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.quantidade = quantidade;
        this.quantidade_reservada = quantidade_reservada;
        this.estoque_minimo = estoque_minimo;
        this.data_atualizacao = data_atualizacao;
        this.produtoVariacaoId = produtoVariacaoId;
        this.produtoVariacao = produtoVariacao;
    }
}