import prisma from '@/src/lib/prisma';
import { Imagem } from '@/src/model/imagem';
import { Produto } from '@/src/model/produto';

export class ImagemRepository {

    async salvar(obj: Imagem) {
        return await prisma.imagem.create({
            data: {
                url: obj.url,
                ordem: obj.ordem,
                tipo: obj.tipo,
                produtoId: Number(obj.produtoId)
            },
            include: { produto: true }
        });
    }

    async listarTodos() {
        const dados = await prisma.imagem.findMany({
            include: { produto: true }
        });

        return dados.map(d => new Imagem(
            d.url,
            d.tipo,
            d.produtoId,
            new Produto(
                d.produto.nome, d.produto.descricao, d.produto.preco, d.produto.status,
                d.produto.categoriaId, d.produto.lojaId, null, null, d.produto.destaque, d.produto.id
            ),
            d.ordem,
            d.id
        ));
    }

    async buscarPorId(id: number | bigint) {
        const dado = await prisma.imagem.findUnique({
            where: { id: Number(id) },
            include: { produto: true }
        });

        if (!dado) return null;

        return new Imagem(
            dado.url,
            dado.tipo,
            dado.produtoId,
            new Produto(
                dado.produto.nome, dado.produto.descricao, dado.produto.preco, dado.produto.status,
                dado.produto.categoriaId, dado.produto.lojaId, null, null, dado.produto.destaque, dado.produto.id
            ),
            dado.ordem,
            dado.id
        );
    }

    async atualizar(id: number | bigint, obj: Imagem) {
        return await prisma.imagem.update({
            where: { id: Number(id) },
            data: {
                url: obj.url,
                ordem: obj.ordem,
                tipo: obj.tipo,
                produtoId: Number(obj.produtoId)
            },
            include: { produto: true }
        });
    }

    async excluir(id: number | bigint) {
        return await prisma.imagem.delete({
            where: { id: Number(id) }
        });
    }
}