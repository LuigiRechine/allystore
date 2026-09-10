import { NextResponse } from 'next/server';
import { PagamentoRepository } from '@/src/repository/pagamentoRepository';
import { PagamentoService } from '@/src/service/pagamentoService';

const service = new PagamentoService(new PagamentoRepository());

export async function GET(){
    try {
        const todosPagamentos = await service.listar();
        return NextResponse.json(todosPagamentos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.valor, body.metodo, body.status, body.codigoTransacao, body.pedidoId);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}