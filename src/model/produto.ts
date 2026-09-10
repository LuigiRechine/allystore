import { Categoria } from "./categoria";
import { Loja } from "./loja";
import { ProdutoVariacao } from "./produtoVariacao";
import { Imagem } from "./imagem";
import { ProdutoPedido } from "./produtoPedido";

export class Produto {
    id: number | any;
    nome: string;
    descricao: string;
    preco: any;
    status: string;
    destaque: boolean;

    categoriaId: number | any;
    lojaId: number | any;

    categoria? : Categoria | null;
    loja? : Loja | null;

    produtosVariacao: ProdutoVariacao[] = [];
    imagens: Imagem[] = [];
    produtoPedido: ProdutoPedido[] = [];

    constructor(
        nome: string,
        descricao: string,
        preco: any,
        status: string,
        categoriaId: number | any,
        lojaId: number | any,
        categoria: Categoria | null,
        loja: Loja | null,
        destaque: boolean = true,
        id: number | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.status = status;
        this.destaque = destaque;
        this.categoriaId = categoriaId;
        this.lojaId = lojaId;
        this.categoria = categoria;
        this.loja = loja;
    }
}