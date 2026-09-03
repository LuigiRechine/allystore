import { Loja } from "./loja";
import { Usuario } from "./usuario";

export class Lojista {
    id: bigint | any;
    cargo: String;
    data_vinculo: Date;

    usuarioId: bigint | any;
    lojaId: bigint | any;

    usuario: Usuario;
    loja: Loja;

    constructor(

        cargo: String,
        usuarioId: bigint | any,
        lojaId: bigint | any,
        usuario: Usuario,
        loja: Loja,
        data_vinculo: Date,
        id: bigint | any = null
    ) {
        this.id = id;
        this.cargo = cargo;
        this.data_vinculo = data_vinculo;
        this.usuarioId = usuarioId;
        this.lojaId = lojaId;
        this.usuario = usuario;
        this.loja = loja;
    }


}