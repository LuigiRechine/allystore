import { NextResponse } from 'next/server';
import { EstoqueRepository } from '@/src/repository/estoqueRepository';
import { EstoqueService } from '@/src/service/estoqueService';

const service = new EstoqueService(new EstoqueRepository());

export async function GET(){
    try {
        const todosEstoques = await service.listar();
        return NextResponse.json(todosEstoques, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.produtoVariacaoId, body.quantidade, body.quantidade_reservada, body.estoque_minimo);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}