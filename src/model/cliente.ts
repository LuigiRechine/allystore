import { Carrinho } from "@prisma/client";
import { Loja } from "./loja";
import { Usuario } from "./usuario";
import {Pedido} from './pedido';

export class Cliente {
    id: bigint | any;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    dataCadastro: Date;

    usuarioId: bigint | any;
    lojaId: bigint | any;

    usuario?: Usuario;
    loja?: Loja;
    carrinho?: Carrinho | null;
    pedidos?: Pedido[];

    constructor(
        nome: string,
        email: string,
        telefone: string,
        cpf: string,
        usuarioid: bigint | any,
        lojaId: bigint | any,
        dataCadastro: Date,
        usuario?: Usuario,
        loja?: Loja,
        carrinho?: Carrinho | null,
        pedidos: Pedido[] = [],
        id: bigint | any = null
    ) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.dataCadastro = dataCadastro;
        this.usuarioId = usuarioid;
        this.lojaId = lojaId;
        this.usuario = usuario;
        this.loja = loja;
        this.carrinho = carrinho;
        this.pedidos = pedidos;
    }
}