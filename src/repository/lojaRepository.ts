import prisma from '@/src/lib/prisma';
import { Loja } from '@/src/model/loja';

export class LojaRepository {

    async salvar(obj: Loja) {
        return await prisma.loja.create({
            data: {
                nome: obj.nome,
                slug: obj.slug,
                logo: obj.logo,
                descricao: obj.descricao,
                email: obj.email,
                telefone: obj.telefone,
                status: obj.status
            }
        });
    }

    async listarTodos() {
        const dados = await prisma.loja.findMany();

        return dados.map(d => new Loja(
            d.nome,
            d.slug,
            d.email,
            d.status,
            d.logo,
            d.descricao,
            d.telefone,
            d.dataCriacao,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.loja.findUnique({
            where: { id: Number(id) }
        });

        if (!dado) return null;

        return new Loja(
            dado.nome,
            dado.slug,
            dado.email,
            dado.status,
            dado.logo,
            dado.descricao,
            dado.telefone,
            dado.dataCriacao,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Loja) {
        return await prisma.loja.update({
            where: { id: Number(id) },
            data: {
                nome: obj.nome,
                slug: obj.slug,
                logo: obj.logo,
                descricao: obj.descricao,
                email: obj.email,
                telefone: obj.telefone,
                status: obj.status
            }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.loja.delete({
            where: { id: Number(id) }
        });
    }
}