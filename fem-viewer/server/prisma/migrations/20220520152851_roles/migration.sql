/*
  Warnings:

  - A unique constraint covering the columns `[createdById]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ADMIN', 'DEVELOPER', 'VIEWER') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_createdById_key` ON `User`(`createdById`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
