-- CreateTable
CREATE TABLE `Usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL,

    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
