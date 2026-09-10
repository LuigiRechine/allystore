import { NextResponse } from 'next/server';
import { ClienteRepository } from '@/src/repository/clienteRepository';
import { ClienteService } from '@/src/service/clienteService';

const service = new ClienteService(new ClienteRepository());

export async function GET(){
    try {
        const todosClientes = await service.listar();
        return NextResponse.json(todosClientes, { status: 200 });
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 500});
    }
}

export async function POST(req){
    try{
        const body = await req.json();
        const res = await service.cadastrar(body.nome, body.email, body.telefone, body.cpf, body.usuarioId, body.lojaId, body.dataCadastro);
        return NextResponse.json(res, { status: 201});
    } catch (e) {
        return NextResponse.json({ erro: e.message }, { status: 400});
    }
}