// Cálculo de valores SEMPRE em centavos (inteiros) para não acumular erro de ponto flutuante.

export const paraCentavos = (valor: number | string | { toString(): string }): number =>
  Math.round(Number(valor.toString()) * 100);

export const deCentavos = (centavos: number): number => centavos / 100;

export const DESCONTO_PIX_PERCENTUAL = 10;

/** Preço unitário (centavos) já com o desconto do Pix, arredondado. */
export function precoComDesconto(precoCentavos: number, metodo: 'pix' | 'cartao'): number {
  if (metodo !== 'pix') return precoCentavos;
  return Math.round(precoCentavos * (100 - DESCONTO_PIX_PERCENTUAL) / 100);
}

/** Comissão da plataforma (centavos) sobre o total cobrado. */
export function comissaoCentavos(totalCentavos: number, taxaPercentual: number): number {
  if (!taxaPercentual) return 0;
  return Math.round(totalCentavos * taxaPercentual / 100);
}

/** Status do Mercado Pago -> status interno do Pagamento e do Pedido. */
export function traduzirStatus(statusMp: string): {
  pagamento: 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'estornado';
  pedido: 'novo' | 'pago' | 'cancelado';
} {
  switch (statusMp) {
    case 'approved':
      return { pagamento: 'aprovado', pedido: 'pago' };
    case 'rejected':
      return { pagamento: 'recusado', pedido: 'novo' };      // cliente pode tentar de novo
    case 'cancelled':
      return { pagamento: 'cancelado', pedido: 'cancelado' };
    case 'refunded':
    case 'charged_back':
      return { pagamento: 'estornado', pedido: 'cancelado' };
    default: // pending, in_process, authorized, in_mediation...
      return { pagamento: 'pendente', pedido: 'novo' };
  }
}
