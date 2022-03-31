-- DropForeignKey
ALTER TABLE `File` DROP FOREIGN KEY `File_modelGroupId_fkey`;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_modelGroupId_fkey` FOREIGN KEY (`modelGroupId`) REFERENCES `ModelGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
