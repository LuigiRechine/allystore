import { Usuario } from "./usuario";

export class Administrador {
    id: bigint | any;
    nivelAcesso: String;

    usuarioId: bigint | any;
    usuario: Usuario;

    constructor(
        nivelAcesso: String,
        usuarioId: bigint | any,
        usuario: Usuario,
        id: bigint | any = null
    ) {
        this.id = id;
        this.nivelAcesso = nivelAcesso;
        this.usuarioId = usuarioId;
        this.usuario = usuario;
    }
}