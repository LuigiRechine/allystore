import { Produto } from "./produto";

export class Imagem {
    id: number | any;
    url: string;
    ordem: number;
    tipo: string;

    produtoId: number | any;

    produto? : Produto | null;

    constructor(
        url: string,
        tipo: string,
        produtoId: number | any,
        produto: Produto | null,
        ordem: number = 0,
        id: number | any = null
    ) {
        this.id = id;
        this.url = url;
        this.ordem = ordem;
        this.tipo = tipo;
        this.produtoId = produtoId;
        this.produto = produto;
    }
}