import { NextResponse } from 'next/server';
import { ProdutoCarrinhoRepository } from '@/src/repository/produtoCarrinhoRepository';
import { ProdutoCarrinhoService } from '@/src/service/produtoCarrinhoService';

const service = new ProdutoCarrinhoService(new ProdutoCarrinhoRepository());

export async function GET(){
    try {
        const todosProdutoCarrinhos = await service.listar();
        return NextResponse.json(todosProdutoCarrinhos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.quantidade, body.preco_unitario, body.carrinhoId, body.produtoVariacaoId);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}