// Cliente HTTP das rotas em /app/api. Todas as rotas seguem o mesmo padrão:
//   GET    /api/<entidade>        -> lista
//   POST   /api/<entidade>        -> cria
//   GET    /api/<entidade>/[id]   -> busca
//   PUT    /api/<entidade>/[id]   -> atualiza
//   DELETE /api/<entidade>/[id]   -> exclui
//
// O backend retorna { erro: "mensagem" } em caso de falha, então tratamos isso
// aqui e lançamos um Error com a mensagem vinda do service.

import type {
  Administrador, Carrinho, Categoria, Cliente, Estoque, Imagem, Loja, Lojista,
  Pagamento, Pedido, Produto, ProdutoCarrinho, ProdutoPedido, ProdutoVariacao, Usuario,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function montarUrl(caminho: string, query?: Query) {
  const qs = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
  }
  const sufixo = qs.toString();
  return `/api/${caminho}${sufixo ? `?${sufixo}` : ''}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });

  const texto = await res.text();
  let dados: unknown = null;
  if (texto) {
    try { dados = JSON.parse(texto); } catch { dados = texto; }
  }

  if (!res.ok) {
    const msg =
      dados && typeof dados === 'object' && 'erro' in dados
        ? String((dados as { erro: unknown }).erro)
        : `Falha na requisição (${res.status})`;
    throw new ApiError(msg, res.status);
  }

  return dados as T;
}

/**
 * Cria um conjunto de métodos CRUD para uma entidade.
 * O filtro por query string só funciona se você aplicar os arquivos de rota
 * editados (pasta `api-editada/`). Sem eles, use `listar()` e filtre no cliente.
 */
function recurso<T>(nome: string) {
  return {
    listar: (query?: Query) => request<T[]>(montarUrl(nome, query)),
    buscar: (id: number | string) => request<T>(montarUrl(`${nome}/${id}`)),
    criar: (corpo: Record<string, unknown>) =>
      request<T>(montarUrl(nome), { method: 'POST', body: JSON.stringify(corpo) }),
    atualizar: (id: number | string, corpo: Record<string, unknown>) =>
      request<T>(montarUrl(`${nome}/${id}`), { method: 'PUT', body: JSON.stringify(corpo) }),
    excluir: (id: number | string) =>
      request<{ id: number }>(montarUrl(`${nome}/${id}`), { method: 'DELETE' }),
  };
}

export const api = {
  usuario: recurso<Usuario>('usuario'),
  administrador: recurso<Administrador>('administrador'),
  lojista: recurso<Lojista>('lojista'),
  cliente: recurso<Cliente>('cliente'),
  loja: recurso<Loja>('loja'),
  categoria: recurso<Categoria>('categoria'),
  produto: recurso<Produto>('produto'),
  produtoVariacao: recurso<ProdutoVariacao>('produtoVariacao'),
  estoque: recurso<Estoque>('estoque'),
  imagem: recurso<Imagem>('imagem'),
  pedido: recurso<Pedido>('pedido'),
  produtoPedido: recurso<ProdutoPedido>('produtoPedido'),
  pagamento: recurso<Pagamento>('pagamento'),
  carrinho: recurso<Carrinho>('carrinho'),
  produtoCarrinho: recurso<ProdutoCarrinho>('produtoCarrinho'),
};

/** Login: usa /api/auth/login se existir; senão cai no fallback client-side. */
export async function login(email: string, senha: string): Promise<Usuario> {
  try {
    return await request<Usuario>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  } catch (e) {
    if (e instanceof ApiError && e.status !== 404) throw e;
    // Fallback: a rota /api/auth/login ainda não foi adicionada ao projeto.
    const usuarios = await api.usuario.listar();
    const achado = usuarios.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && u.senha === senha,
    );
    if (!achado) throw new ApiError('E-mail ou senha inválidos.', 401);
    return achado;
  }
}

/** Busca a loja pelo slug (filtra no cliente para funcionar sem rota editada). */
export async function buscarLojaPorSlug(slug: string): Promise<Loja | null> {
  const lojas = await api.loja.listar();
  return lojas.find((l) => l.slug === slug) ?? null;
}

/** Estoque total de um produto = soma do estoque de todas as suas variações. */
export function estoqueDoProduto(
  produtoId: number,
  variacoes: ProdutoVariacao[],
  estoques: Estoque[],
): number | null {
  const ids = variacoes.filter((v) => Number(v.produtoId) === Number(produtoId)).map((v) => v.id);
  if (ids.length === 0) return null;
  return estoques
    .filter((e) => ids.includes(Number(e.produtoVariacaoId)))
    .reduce((s, e) => s + Number(e.quantidade ?? 0), 0);
}

/** Imagem principal (menor `ordem`) de um produto. */
export function imagemPrincipal(produtoId: number, imagens: Imagem[]): string | null {
  const doProduto = imagens
    .filter((i) => Number(i.produtoId) === Number(produtoId))
    .sort((a, b) => Number(a.ordem) - Number(b.ordem));
  return doProduto[0]?.url ?? null;
}
