import { Usuario } from "./usuario";
import { Loja } from "./loja";

export class Lojista {
    id: number | any;
    cargo: string;
    data_vinculo: Date;

    usuarioId: number | any;
    lojaId: number | any;

    usuario? : Usuario | null;
    loja? : Loja | null;

    constructor(
        cargo: string,
        usuarioId: number | any,
        lojaId: number | any,
        usuario: Usuario | null,
        loja: Loja | null,
        data_vinculo: Date = new Date(),
        id: number | any = null
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