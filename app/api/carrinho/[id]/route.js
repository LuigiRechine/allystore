import { NextResponse } from 'next/server';
import { CarrinhoRepository } from '@/src/repository/carrinhoRepository';
import { CarrinhoService } from '@/src/service/carrinhoService';


const service = new CarrinhoService(new CarrinhoRepository());


// GET: Busca um veículo por ID
export async function GET(req, { params }) {
    try {
        // CORREÇÃO: Adicionando o 'await' para o Next.js 15
        const { id } = await params;
       
        const carrinho = await service.buscarPorId(id);
        return NextResponse.json(carrinho, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 404 });
    }
}


// PUT: Atualiza um veículo existente
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();


        const res = await service.atualizar(id, body.status, body.clienteId, body.lojaId, body.dataCriacao, body.data_atualizacao );
        return NextResponse.json(res, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400 });
    }
}


// DELETE: Remove um veículo
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
       
        const res = await service.excluir(id);
        return NextResponse.json(res, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400 });
    }
}
