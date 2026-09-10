import { NextResponse } from 'next/server';
import { ProdutoRepository } from '@/src/repository/produtoRepository';
import { ProdutoService } from '@/src/service/produtoService';

const service = new ProdutoService(new ProdutoRepository());

export async function GET(){
    try {
        const todosProdutos = await service.listar();
        return NextResponse.json(todosProdutos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.nome, body.descricao, body.preco, body.status, body.categoriaId, body.lojaId, body.destaque);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}