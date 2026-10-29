-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "mpInitPoint" TEXT,
ADD COLUMN     "mpPaymentId" VARCHAR(50),
ADD COLUMN     "mpPreferenceId" VARCHAR(100),
ADD COLUMN     "mpStatusDetalhe" VARCHAR(100);

-- AlterTable
ALTER TABLE "ProdutoPedido" ADD COLUMN     "produtoVariacaoId" INTEGER;

-- CreateTable
CREATE TABLE "MercadoPagoConta" (
    "id" SERIAL NOT NULL,
    "mpUserId" VARCHAR(50) NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "publicKey" VARCHAR(100),
    "liveMode" BOOLEAN NOT NULL DEFAULT true,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "conectadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "lojaId" INTEGER NOT NULL,

    CONSTRAINT "MercadoPagoConta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_mpPaymentId_key" ON "Pagamento"("mpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoConta_lojaId_key" ON "MercadoPagoConta"("lojaId");

-- AddForeignKey
ALTER TABLE "ProdutoPedido" ADD CONSTRAINT "ProdutoPedido_produtoVariacaoId_fkey" FOREIGN KEY ("produtoVariacaoId") REFERENCES "ProdutoVariacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MercadoPagoConta" ADD CONSTRAINT "MercadoPagoConta_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Supabase: a tabela nova também precisa de RLS (igual ao supabase/proteger-tabelas.sql).
-- Sem isso a Data API pública exporia os tokens (criptografados) das lojas.
ALTER TABLE "MercadoPagoConta" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "MercadoPagoConta" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "MercadoPagoConta_id_seq" FROM anon, authenticated;
