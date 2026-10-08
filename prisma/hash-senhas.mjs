import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const usuarios = await prisma.usuario.findMany();
let n = 0;

for (const u of usuarios) {
  if (/^\$2[aby]\$/.test(u.senha)) continue; // já é hash
  await prisma.usuario.update({
    where: { id: u.id },
    data: { senha: await bcrypt.hash(u.senha, 10), email: u.email.trim().toLowerCase() },
  });
  n++;
}
console.log(`${n} senha(s) convertida(s).`);
await prisma.$disconnect();