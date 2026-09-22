# AllysTore — Frontend (Next.js App Router)

Telas geradas a partir do protótipo do Figma Maker, já ligadas nas rotas de API
do seu projeto. Copie o conteúdo desta pasta **por cima da raiz do projeto
`allystore/`**, mantendo a estrutura de diretórios.

## Como aplicar

```bash
# na raiz do projeto allystore
cp -r allystore-frontend/. .
rm src/lib/prisma.js        # foi substituído por src/lib/prisma.ts
npm run dev
```

Nenhuma dependência nova é necessária — tudo usa React + Tailwind v4, que já
estão no seu `package.json`. Os ícones são SVG escritos à mão (sem lucide) e o
gráfico é SVG/CSS puro (sem recharts).

## Rotas criadas

### Loja pública (cliente)
| Rota | Tela |
|---|---|
| `/loja/[slug]` | Vitrine (hero, categorias, grid de produtos) |
| `/loja/[slug]/produto/[id]` | Detalhe do produto (variações, tamanho, cor) |
| `/loja/[slug]/carrinho` | Carrinho |
| `/loja/[slug]/checkout` | Checkout (dados, endereço, forma de pagamento) |
| `/loja/[slug]/pagamento/[pedidoId]` | Pix: aguardando / aprovado / expirado |
| `/loja/[slug]/confirmacao/[pedidoId]` | Pedido confirmado |
| `/loja/[slug]/entrar` | Login e cadastro do cliente |
| `/loja/[slug]/conta` | Minha conta + histórico de pedidos |

### Painel do lojista
| Rota | Tela |
|---|---|
| `/painel/entrar` | Login |
| `/painel/criar-loja` | Onboarding em 3 passos |
| `/painel` | Dashboard (métricas reais do banco) |
| `/painel/produtos` | Lista de produtos |
| `/painel/produtos/novo` · `/painel/produtos/[id]` | Formulário de produto |
| `/painel/pedidos` · `/painel/pedidos/[id]` | Pedidos e detalhe com timeline |
| `/painel/loja` | Personalização da loja + categorias |
| `/painel/configuracoes` | Perfil, segurança, notificações |

### Painel administrativo
| Rota | Tela |
|---|---|
| `/admin/entrar` | Login (tema escuro) |
| `/admin` | Dashboard da plataforma (GMV, lojas ativas, gráfico) |
| `/admin/lojas` | Gestão de lojas (ativar / desativar) |

## Arquivos editados do backend

- **`src/lib/prisma.ts`** — substitui `src/lib/prisma.js`. Como o arquivo era
  `.js` e `globalThis` é `any`, o `prisma` exportado virava `any` e **os 15
  repositories quebravam o `next build`** com
  `Parameter 'd' implicitly has an 'any' type`. Tipando aqui, os 16 erros somem.
- **`app/api/auth/login/route.js`** (novo) — login por e-mail/senha usando o
  `UsuarioRepository`, no mesmo padrão model/repository/service. O client tem
  fallback caso você prefira não aplicar.
- **`app/layout.tsx`**, **`app/globals.css`**, **`app/page.tsx`** — fonte Inter,
  `lang="pt-BR"`, remoção do dark mode e home listando as lojas ativas.

## Como o frontend conversa com a API

`src/lib/api.ts` é um client tipado para as 15 entidades, seguindo o padrão das
suas rotas (`GET /api/x`, `POST /api/x`, `GET|PUT|DELETE /api/x/[id]`).

Fluxo real do checkout:

1. `POST /api/pedido` → cria o pedido com status `novo`
2. `POST /api/produtoPedido` → um por item do carrinho
3. `POST /api/pagamento` → pagamento `pendente`
4. redireciona para `/loja/[slug]/pagamento/[pedidoId]`
5. "Simular aprovação" faz `PUT` no pagamento (`aprovado`) e no pedido (`pago`)

### Estoque

O schema controla estoque em `Estoque` → `ProdutoVariacao`, não no `Produto`.
O frontend soma o estoque de todas as variações do produto. No cadastro, se você
preencher quantidade/SKU, uma **variação padrão** (`cor: "Padrão"`,
`tamanho: "Único"`) e o `Estoque` são criados automaticamente.

## Pendências conhecidas

- **Sessão**: hoje é `localStorage` (`src/lib/session.ts`). Antes de produção,
  troque por cookie `httpOnly` + JWT ou uma lib de auth.
- **Senhas em texto puro**: aplique hash (bcrypt/argon2) no
  `UsuarioService.cadastrar` e ajuste `app/api/auth/login/route.js` para usar
  `bcrypt.compare`.
- **Filtros**: suas rotas `GET` não aceitam query params, então as listagens
  buscam tudo e filtram no cliente. Adicionar `?lojaId=`/`?produtoId=` nas rotas
  reduz bastante o tráfego.
- **Upload de imagem**: os formulários pedem a **URL** da imagem. Para upload de
  arquivo, integre S3 / Cloudinary / UploadThing.
- **Endereço de entrega**: preenchido no checkout mas não persistido — falta um
  model `Endereco` ligado a `Cliente`.
- **Notificações**: a aba existe, mas não há tabela de preferências no schema.
- **Pix**: o QR é ilustrativo. Para cobrança real, integre um PSP
  (Mercado Pago, Asaas, Efí) e troque o "simular aprovação" por um webhook que
  atualize `/api/pagamento` e `/api/pedido`.
