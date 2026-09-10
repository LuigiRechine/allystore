import prisma from '@/src/lib/prisma';
import { Usuario } from '@/src/model/usuario';

export class UsuarioRepository {

    async salvar(obj: Usuario) {
        return await prisma.usuario.create({
            data: {
                nome: obj.nome,
                email: obj.email,
                senha: obj.senha,
                telefone: obj.telefone,
                tipo: obj.tipo,
                status: obj.status
            }
        });
    }

    async listarTodos() {
        const dados = await prisma.usuario.findMany();

        return dados.map(d => new Usuario(
            d.nome,
            d.email,
            d.senha,
            d.telefone,
            d.tipo,
            d.status,
            d.dataCriacao,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.usuario.findUnique({
            where: { id: Number(id) }
        });

        if (!dado) return null;

        return new Usuario(
            dado.nome,
            dado.email,
            dado.senha,
            dado.telefone,
            dado.tipo,
            dado.status,
            dado.dataCriacao,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Usuario) {
        return await prisma.usuario.update({
            where: { id: Number(id) },
            data: {
                nome: obj.nome,
                email: obj.email,
                senha: obj.senha,
                telefone: obj.telefone,
                tipo: obj.tipo,
                status: obj.status
            }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.usuario.delete({
            where: { id: Number(id) }
        });
    }
}