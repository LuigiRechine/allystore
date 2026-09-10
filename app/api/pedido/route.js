import { NextResponse } from 'next/server';
import { PedidoRepository } from '@/src/repository/pedidoRepository';
import { PedidoService } from '@/src/service/pedidoService';

const service = new PedidoService(new PedidoRepository());

export async function GET(){
    try {
        const todosPedidos = await service.listar();
        return NextResponse.json(todosPedidos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.status, body.clienteId, body.lojaId);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}