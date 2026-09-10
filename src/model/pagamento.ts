import { Pedido } from "./pedido";

export class Pagamento {
    id: number | any;
    valor: any;
    metodo: string;
    status: string;
    codigoTransacao: string;
    dataPagamento: Date;

    pedidoId: number | any;

    pedido? : Pedido | null;

    constructor(
        valor: any,
        metodo: string,
        status: string,
        codigoTransacao: string,
        pedidoId: number | any,
        pedido: Pedido | null,
        dataPagamento: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.valor = valor;
        this.metodo = metodo;
        this.status = status;
        this.codigoTransacao = codigoTransacao;
        this.dataPagamento = dataPagamento;
        this.pedidoId = pedidoId;
        this.pedido = pedido;
    }
}