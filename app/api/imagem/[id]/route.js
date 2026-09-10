import { NextResponse } from 'next/server';
import { ImagemRepository } from '@/src/repository/imagemRepository';
import { ImagemService } from '@/src/service/imagemService';


const service = new ImagemService(new ImagemRepository());


// GET: Busca um veículo por ID
export async function GET(req, { params }) {
    try {
        // CORREÇÃO: Adicionando o 'await' para o Next.js 15
        const { id } = await params;
       
        const imagem = await service.buscarPorId(id);
        return NextResponse.json(imagem, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 404 });
    }
}


// PUT: Atualiza um veículo existente
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();


        const res = await service.atualizar(id, body.url, body.tipo, body.produtoId, body.ordem);
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
