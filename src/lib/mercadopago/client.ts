import { API_MP, mp, redirectUriOAuth } from './config';

/** Erro com mensagem segura para mostrar ao usuário; `detalhe` vai só para o log. */
export class ErroMP extends Error {
  status: number;
  detalhe?: unknown;
  constructor(mensagem: string, status = 502, detalhe?: unknown) {
    super(mensagem);
    this.name = 'ErroMP';
    this.status = status;
    this.detalhe = detalhe;
  }
}

async function chamar<T>(caminho: string, init: RequestInit & { token?: string; json?: unknown } = {}): Promise<T> {
  const { token, json, headers, ...resto } = init;
  const res = await fetch(`${API_MP}${caminho}`, {
    ...resto,
    cache: 'no-store',
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : resto.body,
  });

  const texto = await res.text();
  let dados: unknown = null;
  try { dados = texto ? JSON.parse(texto) : null; } catch { dados = texto; }

  if (!res.ok) {
    console.error(`[mercadopago] ${init.method ?? 'GET'} ${caminho} -> ${res.status}`, dados);
    throw new ErroMP('Falha ao falar com o Mercado Pago.', res.status >= 500 ? 502 : 400, dados);
  }
  return dados as T;
}

// ---------- OAuth ----------

export interface RespostaOAuth {
  access_token: string;
  refresh_token: string;
  public_key?: string;
  live_mode?: boolean;
  user_id: number | string;
  expires_in: number; // segundos (~180 dias)
}

export function trocarCodigoPorToken(code: string) {
  return chamar<RespostaOAuth>('/oauth/token', {
    method: 'POST',
    json: {
      client_id: mp.clientId(),
      client_secret: mp.clientSecret(),
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriOAuth(),
    },
  });
}

export function renovarToken(refreshToken: string) {
  return chamar<RespostaOAuth>('/oauth/token', {
    method: 'POST',
    json: {
      client_id: mp.clientId(),
      client_secret: mp.clientSecret(),
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
  });
}

// ---------- Checkout Pro ----------

export interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'BRL';
  picture_url?: string;
}

export interface CorpoPreferencia {
  items: ItemPreferencia[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: { area_code?: string; number?: string };
    identification?: { type: 'CPF'; number: string };
  };
  external_reference: string;
  notification_url: string;
  back_urls: { success: string; pending: string; failure: string };
  auto_return?: 'approved' | 'all';
  marketplace_fee?: number;
  payment_methods?: {
    excluded_payment_types?: { id: string }[];
    excluded_payment_methods?: { id: string }[];
    installments?: number;
  };
  statement_descriptor?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

export function criarPreferencia(tokenDaLoja: string, corpo: CorpoPreferencia, chaveIdempotencia: string) {
  return chamar<{ id: string; init_point: string; sandbox_init_point: string }>('/checkout/preferences', {
    method: 'POST',
    token: tokenDaLoja,
    json: corpo,
    headers: { 'X-Idempotency-Key': chaveIdempotencia },
  });
}

export interface PagamentoMP {
  id: number;
  status: string;            // approved | pending | in_process | rejected | cancelled | refunded | charged_back ...
  status_detail?: string;
  external_reference?: string | null;
  transaction_amount: number;
  payment_type_id?: string;
  payment_method_id?: string;
  live_mode?: boolean;
}

export function buscarPagamento(tokenDaLoja: string, paymentId: string | number) {
  return chamar<PagamentoMP>(`/v1/payments/${encodeURIComponent(String(paymentId))}`, { token: tokenDaLoja });
}

/** Pagamentos de um pedido (external_reference), do mais novo para o mais antigo. */
export async function buscarPagamentosPorReferencia(tokenDaLoja: string, referencia: string | number) {
  const qs = new URLSearchParams({
    external_reference: String(referencia),
    sort: 'date_created',
    criteria: 'desc',
    limit: '10',
  });
  const r = await chamar<{ results?: PagamentoMP[] }>(`/v1/payments/search?${qs}`, { token: tokenDaLoja });
  return r.results ?? [];
}
