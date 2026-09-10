import { Loja } from "./loja";
import { Produto } from "./produto";

export class Categoria {
    id: number | any;
    nome: string;
    descricao: string | null;
    status: string;

    lojaId: number | any;

    loja?: Loja | null;
    produtos: Produto[] = [];

    constructor(
        nome: string,
        status: string,
        lojaId: number | any,
        loja: Loja | null,
        descricao: string | null = null,
        id: number | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.status = status;
        this.lojaId = lojaId;
        this.loja = loja;
    }
}