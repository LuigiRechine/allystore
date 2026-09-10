import { NextResponse } from 'next/server';
import { ProdutoVariacaoRepository } from '@/src/repository/produtoVariacaoRepository';
import { ProdutoVariacaoService } from '@/src/service/produtoVariacaoService';

const service = new ProdutoVariacaoService(new ProdutoVariacaoRepository());

export async function GET() {
    try {
        const todosprodutoVariacaos = await service.listar();
        return NextResponse.json(todosprodutoVariacaos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const res = await service.cadastrar(body.sku, body.cor, body.tamanho, body.preco, body.status, body.produtoId);
        return NextResponse.json(res, { status: 201 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400 });
    }
}