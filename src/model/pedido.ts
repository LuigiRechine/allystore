import { Cliente } from "./cliente";
import { Loja } from "./loja";
import { ProdutoPedido } from "./produtoPedido";
import { Pagamento } from "./pagamento";

export class Pedido {
    id: number | any;
    data: Date;
    status: string;

    clienteId: number | any;
    lojaId: number | any;

    cliente? : Cliente | null;
    loja? : Loja | null;

    produtosPedidos: ProdutoPedido[] = [];
    pagamento: Pagamento[] = [];

    constructor(
        status: string,
        clienteId: number | any,
        lojaId: number | any,
        cliente: Cliente | null,
        loja: Loja | null,
        data: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.data = data;
        this.status = status;
        this.clienteId = clienteId;
        this.lojaId = lojaId;
        this.cliente = cliente;
        this.loja = loja;
    }
}