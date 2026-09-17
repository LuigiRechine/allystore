// Espelha os models do backend (src/model/*). Campos opcionais aparecem
// conforme o repository faz include.

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  telefone: string;
  tipo: string;   // 'admin' | 'lojista' | 'cliente'
  status: string; // 'ativo' | 'inativo'
  dataCriacao?: string;
}

export interface Loja {
  id: number;
  nome: string;
  slug: string;
  logo: string | null;
  descricao: string | null;
  email: string;
  telefone: string | null;
  status: string; // 'ativo' | 'inativo' | 'pendente'
  dataCriacao?: string;
}

export interface Lojista {
  id: number;
  cargo: string;
  usuarioId: number;
  lojaId: number;
  usuario?: Usuario | null;
  loja?: Loja | null;
  data_vinculo?: string;
}

export interface Administrador {
  id: number;
  nivelAcesso: string;
  usuarioId: number;
  usuario?: Usuario | null;
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  usuarioId: number;
  lojaId: number;
  usuario?: Usuario | null;
  loja?: Loja | null;
  dataCadastro?: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  status: string;
  lojaId: number;
  loja?: Loja | null;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: string | number;
  status: string;
  destaque: boolean;
  categoriaId: number;
  lojaId: number;
  categoria?: Categoria | null;
  loja?: Loja | null;
}

export interface ProdutoVariacao {
  id: number;
  sku: string;
  cor: string;
  tamanho: string;
  preco: string | number;
  status: string;
  produtoId: number;
  produto?: Produto | null;
}

export interface Estoque {
  id: number;
  quantidade: number;
  quantidade_reservada: number;
  estoque_minimo: number;
  produtoVariacaoId: number;
  produtoVariacao?: ProdutoVariacao | null;
  data_atualizacao?: string;
}

export interface Imagem {
  id: number;
  url: string;
  ordem: number;
  tipo: string;
  produtoId: number;
}

export interface Pedido {
  id: number;
  data: string;
  status: string; // novo | pago | preparacao | enviado | entregue | cancelado
  clienteId: number;
  lojaId: number;
  cliente?: Cliente | null;
  loja?: Loja | null;
}

export interface ProdutoPedido {
  id: number;
  quantidade: number;
  preco_unitario: string | number;
  subtotal: string | number;
  pedidoId: number;
  produtoId: number;
  produto?: Produto | null;
  pedido?: Pedido | null;
}

export interface Pagamento {
  id: number;
  valor: string | number;
  metodo: string; // pix | cartao
  status: string; // pendente | aprovado | expirado | cancelado
  codigoTransacao: string;
  dataPagamento: string;
  pedidoId: number;
}

export interface Carrinho {
  id: number;
  status: string;
  clienteId: number;
  lojaId: number;
}

export interface ProdutoCarrinho {
  id: number;
  quantidade: number;
  preco_unitario: string | number;
  carrinhoId: number;
  produtoVariacaoId: number;
}
