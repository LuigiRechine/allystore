import { PrismaClient } from '@prisma/client';

// Remove qualquer campo "senha" (inclusive aninhado em include) do resultado.
function removerSenha<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map(removerSenha) as T;
  if (valor && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    const copia: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor)) {
      if (k !== 'senha') copia[k] = removerSenha(v);
    }
    return copia as T;
  }
  return valor; // Date, Decimal, null etc. passam direto
}

function criarClientes() {
  const base = new PrismaClient();
  const seguro = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          return removerSenha(await query(args));
        },
      },
    },
  });
  return { base, seguro };
}

const globalForPrisma = globalThis as unknown as { clientes?: ReturnType<typeof criarClientes> };
const clientes = globalForPrisma.clientes ?? criarClientes();
if (process.env.NODE_ENV !== 'production') globalForPrisma.clientes = clientes;

/** Só para login/cadastro, que precisam ler o hash da senha. Não use em mais nenhum lugar. */
export const prismaComSenha = clientes.base;

/** Padrão: nunca devolve senha. Os repositories continuam importando este. */
export default clientes.seguro;