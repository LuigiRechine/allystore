import prisma from '@/src/lib/prisma';
import { Lojista } from '@/src/model/lojista';
import { Usuario } from '@/src/model/usuario';
import { Loja } from '@/src/model/loja';

export class LojistaRepository {

    async salvar(obj: Lojista) {
        return await prisma.lojista.create({
            data: {
                cargo: obj.cargo,
                usuarioId: Number(obj.usuarioId),
                lojaId: Number(obj.lojaId)
            },
            include: { usuario: true, loja: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.lojista.findMany({
            include: { usuario: true, loja: true }
        });

        return dados.map(d => new Lojista(
            d.cargo,
            d.usuarioId,
            d.lojaId,
            new Usuario(
                d.usuario.nome, d.usuario.email, d.usuario.senha, d.usuario.telefone,
                d.usuario.tipo, d.usuario.status, d.usuario.dataCriacao, d.usuario.id
            ),
            new Loja(
                d.loja.nome, d.loja.slug, d.loja.email, d.loja.status,
                d.loja.logo, d.loja.descricao, d.loja.telefone, d.loja.dataCriacao, d.loja.id
            ),
            d.data_vinculo,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.lojista.findUnique({
            where: { id: Number(id) },
            include: { usuario: true, loja: true }
        });

        if (!dado) return null;

        return new Lojista(
            dado.cargo,
            dado.usuarioId,
            dado.lojaId,
            new Usuario(
                dado.usuario.nome, dado.usuario.email, dado.usuario.senha, dado.usuario.telefone,
                dado.usuario.tipo, dado.usuario.status, dado.usuario.dataCriacao, dado.usuario.id
            ),
            new Loja(
                dado.loja.nome, dado.loja.slug, dado.loja.email, dado.loja.status,
                dado.loja.logo, dado.loja.descricao, dado.loja.telefone, dado.loja.dataCriacao, dado.loja.id
            ),
            dado.data_vinculo,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Lojista) {
        return await prisma.lojista.update({
            where: { id: Number(id) },
            data: {
                cargo: obj.cargo,
                usuarioId: Number(obj.usuarioId),
                lojaId: Number(obj.lojaId)
            },
            include: { usuario: true, loja: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.lojista.delete({
            where: { id: Number(id) }
        });
    }
}