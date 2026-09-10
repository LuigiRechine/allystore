import { NextResponse } from 'next/server';
import { ImagemRepository } from '@/src/repository/imagemRepository';
import { ImagemService } from '@/src/service/imagemService';

const service = new ImagemService(new ImagemRepository());

export async function GET(){
    try {
        const todosImagems = await service.listar();
        return NextResponse.json(todosImagems, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.url, body.tipo, body.produtoId, body.ordem);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}