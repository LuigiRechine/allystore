/*
  Warnings:

  - You are about to drop the column `produtoId` on the `pagamento` table. All the data in the column will be lost.
  - Added the required column `pedidoId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pagamento` DROP FOREIGN KEY `Pagamento_produtoId_fkey`;

-- AlterTable
ALTER TABLE `pagamento` DROP COLUMN `produtoId`,
    ADD COLUMN `pedidoId` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
