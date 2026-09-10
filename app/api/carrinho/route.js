import { NextResponse } from 'next/server';
import { CarrinhoRepository } from '@/src/repository/carrinhoRepository';
import { CarrinhoService } from '@/src/service/carrinhoService';

const service = new CarrinhoService(new CarrinhoRepository());

export async function GET(){
    try {
        const todosCarrinhos = await service.listar();
        return NextResponse.json(todosCarrinhos, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.status, body.clienteId, body.lojaId, body.dataCriacao, body.data_atualizacao );
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}