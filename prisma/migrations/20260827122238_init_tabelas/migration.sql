-- CreateTable
CREATE TABLE `Loja` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `logo` VARCHAR(500) NULL,
    `descricao` TEXT NULL,
    `email` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `status` VARCHAR(30) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Loja_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Administrador` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nivelAcesso` VARCHAR(30) NOT NULL,
    `usuarioId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lojista` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `cargo` VARCHAR(30) NOT NULL,
    `data_vinculo` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` BIGINT NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` BIGINT NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `status` VARCHAR(30) NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produto` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `destaque` BOOLEAN NOT NULL DEFAULT true,
    `categoriaId` BIGINT NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoVariacao` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(100) NOT NULL,
    `cor` VARCHAR(50) NOT NULL,
    `tamanho` VARCHAR(30) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `produtoId` BIGINT NOT NULL,

    UNIQUE INDEX `ProdutoVariacao_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Imagem` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(500) NOT NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `tipo` VARCHAR(255) NOT NULL,
    `produtoId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Estoque` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `quantidade_reservada` INTEGER NOT NULL DEFAULT 0,
    `estoque_minimo` INTEGER NOT NULL DEFAULT 0,
    `data_atualizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `produtoVariacaoId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Carrinho` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(255) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` BIGINT NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoCarrinho` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `carrinhoId` BIGINT NOT NULL,
    `produtoVariacaoId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pedido` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(255) NOT NULL,
    `clienteId` BIGINT NOT NULL,
    `lojaId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoPedido` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `pedidoId` BIGINT NOT NULL,
    `produtoId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagamento` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `valor` DECIMAL(10, 2) NOT NULL,
    `metodo` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `codigoTransacao` VARCHAR(255) NOT NULL,
    `dataPagamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `produtoId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Administrador` ADD CONSTRAINT `Administrador_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lojista` ADD CONSTRAINT `Lojista_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lojista` ADD CONSTRAINT `Lojista_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produto` ADD CONSTRAINT `Produto_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoVariacao` ADD CONSTRAINT `ProdutoVariacao_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Imagem` ADD CONSTRAINT `Imagem_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_produtoVariacaoId_fkey` FOREIGN KEY (`produtoVariacaoId`) REFERENCES `ProdutoVariacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Carrinho` ADD CONSTRAINT `Carrinho_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Carrinho` ADD CONSTRAINT `Carrinho_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoCarrinho` ADD CONSTRAINT `ProdutoCarrinho_carrinhoId_fkey` FOREIGN KEY (`carrinhoId`) REFERENCES `Carrinho`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoCarrinho` ADD CONSTRAINT `ProdutoCarrinho_produtoVariacaoId_fkey` FOREIGN KEY (`produtoVariacaoId`) REFERENCES `ProdutoVariacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_lojaId_fkey` FOREIGN KEY (`lojaId`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoPedido` ADD CONSTRAINT `ProdutoPedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoPedido` ADD CONSTRAINT `ProdutoPedido_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
