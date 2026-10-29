-- CreateTable
CREATE TABLE "MercadoPagoConexao" (
    "id" SERIAL NOT NULL,
    "lojistaId" INTEGER NOT NULL,
    "mpUserId" VARCHAR(50) NOT NULL,
    "accessTokenCifrado" TEXT NOT NULL,
    "refreshTokenCifrado" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "conectadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MercadoPagoConexao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MercadoPagoConexao_lojistaId_key" ON "MercadoPagoConexao"("lojistaId");

-- AddForeignKey
ALTER TABLE "MercadoPagoConexao" ADD CONSTRAINT "MercadoPagoConexao_lojistaId_fkey" FOREIGN KEY ("lojistaId") REFERENCES "Lojista"("id") ON DELETE CASCADE ON UPDATE CASCADE;
