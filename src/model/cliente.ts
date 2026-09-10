import { Usuario } from "./usuario";
import { Loja } from "./loja";
import { Carrinho } from "./carrinho";
import { Pedido } from "./pedido";

export class Cliente {
    id: number | any;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    dataCadastro: Date;

    usuarioId: number | any;
    lojaId: number | any;

    usuario?: Usuario | null;
    loja?: Loja | null;

    carrinhos: Carrinho[] = [];
    pedidos: Pedido[] = [];

    constructor(
        nome: string,
        email: string,
        telefone: string,
        cpf: string,
        usuarioId: number | any,
        lojaId: number | any,
        usuario: Usuario | null,
        loja: Loja | null,
        dataCadastro: Date = new Date(),
        id: number | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.dataCadastro = dataCadastro;
        this.usuarioId = usuarioId;
        this.lojaId = lojaId;
        this.usuario = usuario;
        this.loja = loja;
    }
}