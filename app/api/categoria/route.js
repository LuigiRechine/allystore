import { NextResponse } from 'next/server';
import { CategoriaRepository } from '@/src/repository/categoriaRepository';
import { CategoriaService } from '@/src/service/categoriaService';

const service = new CategoriaService(new CategoriaRepository());

export async function GET(){
    try {
        const todosCategorias = await service.listar();
        return NextResponse.json(todosCategorias, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.nome, body.status, body.lojaId, body.descricao);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}