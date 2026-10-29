# Integração Mercado Pago (Checkout Pro, modelo marketplace)

## Como funciona
1. O **lojista** clica em *Painel > Configurações > Pagamentos > Conectar Mercado Pago* (OAuth).
   Os tokens da loja ficam em `MercadoPagoConta`, **criptografados** (AES‑256‑GCM, chave `MP_TOKEN_KEY`).
2. O **cliente** finaliza a compra: `POST /api/checkout` cria, no servidor, pedido + itens + reserva de estoque
   + preferência do Mercado Pago (preços vêm do banco, nunca do navegador) e devolve o link de pagamento.
3. O cliente paga no Mercado Pago (Pix/cartão) e volta para `/loja/[slug]/pagamento/[pedidoId]`.
4. O status real chega por **webhook** (`/api/webhook/mercadopago`); a tela de retorno também consulta o
   Mercado Pago pelo servidor enquanto o webhook não chega. Aprovado => pedido `pago` + baixa de estoque.
5. Um cron diário (`vercel.json`) cancela pedidos abandonados (49 h) e devolve a reserva ao estoque.

## Passo a passo
### 1) Banco (Supabase)
Com `DATABASE_URL`/`DIRECT_URL` no seu `.env` local:
```
npx prisma migrate deploy
npx prisma generate
```
(a migration `20261029200000_mercadopago` já habilita RLS na tabela nova, igual ao `supabase/proteger-tabelas.sql`)

### 2) Variáveis na Vercel (Settings > Environment Variables) — veja `.env.example`
`APP_URL`, `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_WEBHOOK_SECRET`, `MP_TOKEN_KEY`, `MP_TAXA_PERCENTUAL`, `CRON_SECRET`
Depois de salvar, faça **Redeploy**.

### 3) Painel do Mercado Pago (sua aplicação)
- **Redirect URL**: `https://allystore.vercel.app/api/mercadopago/oauth/callback` (já feito; tem que ser idêntica, sem barra final)
- **Webhooks > Configurar notificações** (modo teste e produção): URL `https://allystore.vercel.app/api/webhook/mercadopago`,
  evento **Pagamentos**. Copie a **Assinatura secreta** para `MP_WEBHOOK_SECRET`.
- `MP_CLIENT_ID` = número da aplicação; `MP_CLIENT_SECRET` = Client Secret das credenciais.

### 4) Testar antes de vender de verdade
Use contas de teste do Mercado Pago (um vendedor e um comprador de teste), conecte a loja com a conta **vendedora de teste**
e pague com os cartões/Pix de teste da documentação. Só depois conecte uma conta real.

## Decisões que você pode mudar
- `MP_TAXA_PERCENTUAL`: comissão da plataforma (ex.: `5`). `0` = não cobra.
- Desconto Pix 10% e parcelamento máx. 3x: `src/lib/mercadopago/precos.ts` e `src/service/mercadoPagoService.ts`.
  "Sem juros" depende da configuração de parcelamento da conta do **lojista** no Mercado Pago.
- Prazos: `EXPIRACAO_PREFERENCIA_HORAS` e `ABANDONO_HORAS` em `src/service/mercadoPagoService.ts`.
- Estoque: cada variação deve ter UMA linha em `Estoque` (a de menor id é a usada). Produtos sem variação não têm controle de estoque.

## O que mudou em arquivos existentes
- `prisma/schema.prisma`: `MercadoPagoConta`, campos `mp*` em `Pagamento`, `produtoVariacaoId` em `ProdutoPedido`.
- `proxy.ts`: **clientes não podem mais criar/alterar pedido e pagamento pela API** (antes qualquer logado conseguia dar PUT e marcar "aprovado").
- `app/loja/[slug]/checkout` e `.../pagamento/[pedidoId]`: fluxo real (sem Pix fictício, sem "simular aprovação", sem campos de cartão no seu site).
- `app/painel/(app)/configuracoes`: nova aba **Pagamentos**.
- `src/lib/api.ts`: `iniciarCheckout`, `statusDoCheckout`, `mercadoPago`.
