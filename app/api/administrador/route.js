import { NextResponse } from 'next/server';
import { AdministradorRepository } from '@/src/repository/administradorRepository';
import { AdministradorService } from '@/src/service/administradorService';

const service = new AdministradorService(new AdministradorRepository());

export async function GET(){
    try {
        const todosAdministradores = await service.listar();
        return NextResponse.json(todosAdministradores, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500 });
    }
}

export async function POST(req){
    try {
        const body = await req.json();
        const res = await service.cadastrar(body.nivelAcesso, body.usuarioId);
        return NextResponse.json(res, { status: 201 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400 });
    }
}