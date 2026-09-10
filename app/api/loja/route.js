import { NextResponse } from 'next/server';
import { LojaRepository } from '@/src/repository/lojaRepository';
import { LojaService } from '@/src/service/lojaService';

const service = new LojaService(new LojaRepository());

export async function GET(){
    try {
        const todosLojas = await service.listar();
        return NextResponse.json(todosLojas, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.nome, body.slug, body.email, body.status, body.logo, body.descricao, body.telefone);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}