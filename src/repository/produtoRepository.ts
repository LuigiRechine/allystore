import prisma from '@/src/lib/prisma';
import { Produto } from '@/src/model/produto';
import { Categoria } from '@/src/model/categoria';
import { Loja } from '@/src/model/loja';

export class ProdutoRepository {

    async salvar(obj: Produto) {
        return await prisma.produto.create({
            data: {
                nome: obj.nome,
                descricao: obj.descricao,
                preco: obj.preco,
                status: obj.status,
                destaque: obj.destaque,
                categoriaId: Number(obj.categoriaId),
                lojaId: Number(obj.lojaId)
            },
            include: { categoria: true, loja: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.produto.findMany({
            include: { categoria: true, loja: true }
        });

        return dados.map(d => new Produto(
            d.nome,
            d.descricao,
            d.preco,
            d.status,
            d.categoriaId,
            d.lojaId,
            new Categoria(
                d.categoria.nome, d.categoria.status, d.categoria.lojaId,
                null, d.categoria.descricao, d.categoria.id
            ),
            new Loja(
                d.loja.nome, d.loja.slug, d.loja.email, d.loja.status,
                d.loja.logo, d.loja.descricao, d.loja.telefone, d.loja.dataCriacao, d.loja.id
            ),
            d.destaque,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.produto.findUnique({
            where: { id: Number(id) },
            include: { categoria: true, loja: true }
        });

        if (!dado) return null;

        return new Produto(
            dado.nome,
            dado.descricao,
            dado.preco,
            dado.status,
            dado.categoriaId,
            dado.lojaId,
            new Categoria(
                dado.categoria.nome, dado.categoria.status, dado.categoria.lojaId,
                null, dado.categoria.descricao, dado.categoria.id
            ),
            new Loja(
                dado.loja.nome, dado.loja.slug, dado.loja.email, dado.loja.status,
                dado.loja.logo, dado.loja.descricao, dado.loja.telefone, dado.loja.dataCriacao, dado.loja.id
            ),
            dado.destaque,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Produto) {
        return await prisma.produto.update({
            where: { id: Number(id) },
            data: {
                nome: obj.nome,
                descricao: obj.descricao,
                preco: obj.preco,
                status: obj.status,
                destaque: obj.destaque,
                categoriaId: Number(obj.categoriaId),
                lojaId: Number(obj.lojaId)
            },
            include: { categoria: true, loja: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.produto.delete({
            where: { id: Number(id) }
        });
    }
}