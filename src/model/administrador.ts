import { Usuario } from "./usuario";

export class Administrador {
    id: number | any;
    nivelAcesso: string;

    usuarioId: number | any;
    usuario?: Usuario | null;

    constructor(
        nivelAcesso: string,
        usuarioId: number | any,
        usuario: Usuario | null,
        id: number | any = null
    ) {
        this.id = id;
        this.nivelAcesso = nivelAcesso;
        this.usuarioId = usuarioId;
        this.usuario = usuario;
    }
}