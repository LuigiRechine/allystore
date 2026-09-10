import prisma from '@/src/lib/prisma';
import { Categoria } from '@/src/model/categoria';
import { Loja } from '@/src/model/loja';

export class CategoriaRepository {

    async salvar(obj: Categoria) {
        return await prisma.categoria.create({
            data: {
                nome: obj.nome,
                descricao: obj.descricao,
                status: obj.status,
                lojaId: Number(obj.lojaId)
            },
            include: { loja: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.categoria.findMany({
            include: { loja: true }
        });

        return dados.map(d => new Categoria(
            d.nome,
            d.status,
            d.lojaId,
            new Loja(
                d.loja.nome, d.loja.slug, d.loja.email, d.loja.status,
                d.loja.logo, d.loja.descricao, d.loja.telefone, d.loja.dataCriacao, d.loja.id
            ),
            d.descricao,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.categoria.findUnique({
            where: { id: Number(id) },
            include: { loja: true }
        });

        if (!dado) return null;

        return new Categoria(
            dado.nome,
            dado.status,
            dado.lojaId,
            new Loja(
                dado.loja.nome, dado.loja.slug, dado.loja.email, dado.loja.status,
                dado.loja.logo, dado.loja.descricao, dado.loja.telefone, dado.loja.dataCriacao, dado.loja.id
            ),
            dado.descricao,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Categoria) {
        return await prisma.categoria.update({
            where: { id: Number(id) },
            data: {
                nome: obj.nome,
                descricao: obj.descricao,
                status: obj.status,
                lojaId: Number(obj.lojaId)
            },
            include: { loja: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.categoria.delete({
            where: { id: Number(id) }
        });
    }
}