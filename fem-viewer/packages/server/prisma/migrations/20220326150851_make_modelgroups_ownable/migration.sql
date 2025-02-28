/*
  Warnings:

  - You are about to drop the column `uploadable` on the `ModelGroupsOnUsers` table. All the data in the column will be lost.
  - You are about to drop the column `viewable` on the `ModelGroupsOnUsers` table. All the data in the column will be lost.
  - Added the required column `modelGroupId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `ModelGroupsOnUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `File` ADD COLUMN `modelGroupId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ModelGroupsOnUsers` DROP COLUMN `uploadable`,
    DROP COLUMN `viewable`,
    ADD COLUMN `owner` BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_modelGroupId_fkey` FOREIGN KEY (`modelGroupId`) REFERENCES `ModelGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
