import prisma from '@/src/lib/prisma';
import { Administrador } from '@/src/model/administrador';
import { Usuario } from '@/src/model/usuario';

export class AdministradorRepository {

    async salvar(obj: Administrador) {
        return await prisma.administrador.create({
            data: {
                nivelAcesso: obj.nivelAcesso,
                usuarioId: Number(obj.usuarioId)
            },
            include: { usuario: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.administrador.findMany({
            include: { usuario: true }
        });

        return dados.map(d => new Administrador(
            d.nivelAcesso,
            d.usuarioId,
            new Usuario(
                d.usuario.nome, d.usuario.email, d.usuario.senha, d.usuario.telefone,
                d.usuario.tipo, d.usuario.status, d.usuario.dataCriacao, d.usuario.id
            ),
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.administrador.findUnique({
            where: { id: Number(id) },
            include: { usuario: true }
        });

        if (!dado) return null;

        return new Administrador(
            dado.nivelAcesso,
            dado.usuarioId,
            new Usuario(
                dado.usuario.nome, dado.usuario.email, dado.usuario.senha, dado.usuario.telefone,
                dado.usuario.tipo, dado.usuario.status, dado.usuario.dataCriacao, dado.usuario.id
            ),
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Administrador) {
        return await prisma.administrador.update({
            where: { id: Number(id) },
            data: {
                nivelAcesso: obj.nivelAcesso,
                usuarioId: Number(obj.usuarioId)
            },
            include: { usuario: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.administrador.delete({
            where: { id: Number(id) }
        });
    }
}