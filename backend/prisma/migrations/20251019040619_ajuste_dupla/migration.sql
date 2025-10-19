/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `Usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campeonato` (
    `idCampeonato` INTEGER NOT NULL AUTO_INCREMENT,
    `inicio` DATETIME(3) NOT NULL,
    `fim` DATETIME(3) NOT NULL,
    `inicioInscricoes` DATETIME(3) NOT NULL,
    `fimInscricoes` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idCampeonato`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participante` (
    `idParticipante` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `telefone` CHAR(11) NOT NULL,

    PRIMARY KEY (`idParticipante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dupla` (
    `idDupla` INTEGER NOT NULL AUTO_INCREMENT,
    `idCampeonato` INTEGER NOT NULL,

    PRIMARY KEY (`idDupla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DuplaJogador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idJogador` INTEGER NOT NULL,
    `idDupla` INTEGER NOT NULL,
    `idCampeonato` INTEGER NOT NULL,

    UNIQUE INDEX `DuplaJogador_idDupla_idJogador_key`(`idDupla`, `idJogador`),
    UNIQUE INDEX `DuplaJogador_idCampeonato_idJogador_key`(`idCampeonato`, `idJogador`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Partida` (
    `idMatch` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`idMatch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dupla` ADD CONSTRAINT `Dupla_idCampeonato_fkey` FOREIGN KEY (`idCampeonato`) REFERENCES `Campeonato`(`idCampeonato`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DuplaJogador` ADD CONSTRAINT `DuplaJogador_idJogador_fkey` FOREIGN KEY (`idJogador`) REFERENCES `Participante`(`idParticipante`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DuplaJogador` ADD CONSTRAINT `DuplaJogador_idDupla_fkey` FOREIGN KEY (`idDupla`) REFERENCES `Dupla`(`idDupla`) ON DELETE RESTRICT ON UPDATE CASCADE;
