import { NextResponse } from 'next/server';
import { ProdutoPedidoRepository } from '@/src/repository/produtoPedidoRepository';
import { ProdutoPedidoService } from '@/src/service/produtoPedidoService';

const service = new ProdutoPedidoService(new ProdutoPedidoRepository());

export async function GET(){
    try {
        const todosProdutoPedidos = await service.listar();
        return NextResponse.json(todosProdutoPedidos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.quantidade, body.preco_unitario, body.subtotal, body.pedidoId, body.produtoId);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}