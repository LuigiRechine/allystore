import { PrismaClient } from '@prisma/client';

// Substitui o antigo src/lib/prisma.js.
// Como o arquivo era .js e `globalThis` é `any`, o `prisma` exportado também
// virava `any` — por isso todos os repositories davam
// "Parameter 'd' implicitly has an 'any' type" no `next build`.
// Tipando aqui, os repositories passam a ter inferência correta do Prisma.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
