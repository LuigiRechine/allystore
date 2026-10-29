// Configuração do Mercado Pago lida das variáveis de ambiente (Vercel > Settings > Environment Variables).

function exigir(nome: string): string {
  const v = process.env[nome];
  if (!v) throw new Error(`Variável de ambiente ${nome} não configurada.`);
  return v;
}

/** URL pública do site, sem barra no final. Ex.: https://allystore.vercel.app */
export function urlApp(): string {
  return exigir('APP_URL').replace(/\/+$/, '');
}

/** Tem que ser IDÊNTICA à "Redirect URL" cadastrada na aplicação do Mercado Pago. */
export function redirectUriOAuth(): string {
  return `${urlApp()}/api/mercadopago/oauth/callback`;
}

export const mp = {
  clientId: () => exigir('MP_CLIENT_ID'),
  clientSecret: () => exigir('MP_CLIENT_SECRET'),
  /** "Assinatura secreta" da aba Webhooks da aplicação. Opcional, mas recomendada. */
  webhookSecret: () => process.env.MP_WEBHOOK_SECRET || null,
  /** Comissão da plataforma sobre cada venda, em % (ex.: 5 = 5%). Padrão 0. */
  taxaPercentual: () => {
    const n = Number(process.env.MP_TAXA_PERCENTUAL ?? 0);
    return Number.isFinite(n) && n > 0 && n < 100 ? n : 0;
  },
};

export const API_MP = 'https://api.mercadopago.com';
// Brasil. Para outro país troque o domínio (.com.ar, .com.mx...).
export const AUTH_MP = 'https://auth.mercadopago.com.br/authorization';
