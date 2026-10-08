import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const [email = 'admin@allystore.com', senha = 'Admin@12345'] = process.argv.slice(2);
const prisma = new PrismaClient();

const existente = await prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
if (existente) {
  console.log('Já existe um usuário com esse e-mail.');
} else {
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email: email.toLowerCase(),
      senha: await bcrypt.hash(senha, 10),
      telefone: '11999999999',
      tipo: 'admin',
      status: 'ativo',
    },
  });
  await prisma.administrador.create({ data: { nivelAcesso: 'total', usuarioId: usuario.id } });
  console.log(`Admin criado: ${email} (id ${usuario.id})`);
}
await prisma.$disconnect();