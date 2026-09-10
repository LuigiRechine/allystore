import { Pedido } from "./pedido";
import { Produto } from "./produto";

export class ProdutoPedido {
    id: number | any;
    quantidade: number;
    preco_unitario: any;
    subtotal: any;

    pedidoId: number | any;
    produtoId: number | any;

    pedido? : Pedido | null;
    produto? : Produto | null;

    constructor(
        quantidade: number,
        preco_unitario: any,
        subtotal: any,
        pedidoId: number | any,
        produtoId: number | any,
        pedido: Pedido | null,
        produto: Produto | null,
        id: number | any = null
    ) {
        this.id = id;
        this.quantidade = quantidade;
        this.preco_unitario = preco_unitario;
        this.subtotal = subtotal;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.pedido = pedido;
        this.produto = produto;
    }
}