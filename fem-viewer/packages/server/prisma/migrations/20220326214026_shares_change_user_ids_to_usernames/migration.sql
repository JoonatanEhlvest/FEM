/*
  Warnings:

  - You are about to drop the column `sharedById` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `sharedToId` on the `Share` table. All the data in the column will be lost.
  - Added the required column `sharedByName` to the `Share` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharedToName` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_sharedById_fkey`;

-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_sharedToId_fkey`;

-- AlterTable
ALTER TABLE `Share` DROP COLUMN `sharedById`,
    DROP COLUMN `sharedToId`,
    ADD COLUMN `sharedByName` VARCHAR(191) NOT NULL,
    ADD COLUMN `sharedToName` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_sharedByName_fkey` FOREIGN KEY (`sharedByName`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_sharedToName_fkey` FOREIGN KEY (`sharedToName`) REFERENCES `User`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
