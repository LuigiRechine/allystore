import { NextResponse } from 'next/server';
import { LojistaRepository } from '@/src/repository/lojistaRepository';
import { LojistaService } from '@/src/service/lojistaService';

const service = new LojistaService(new LojistaRepository());

export async function GET(){
    try {
        const todosLojistas = await service.listar();
        return NextResponse.json(todosLojistas, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.cargo, body.usuarioId, body.lojaId);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}