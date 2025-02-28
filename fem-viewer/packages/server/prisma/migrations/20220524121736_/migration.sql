-- DropForeignKey
ALTER TABLE `ModelGroupsOnUsers` DROP FOREIGN KEY `ModelGroupsOnUsers_modelGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `ModelGroupsOnUsers` DROP FOREIGN KEY `ModelGroupsOnUsers_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_modelGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_sharedByName_fkey`;

-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_sharedToName_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_createdById_fkey`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelGroupsOnUsers` ADD CONSTRAINT `ModelGroupsOnUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelGroupsOnUsers` ADD CONSTRAINT `ModelGroupsOnUsers_modelGroupId_fkey` FOREIGN KEY (`modelGroupId`) REFERENCES `ModelGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_sharedByName_fkey` FOREIGN KEY (`sharedByName`) REFERENCES `User`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_sharedToName_fkey` FOREIGN KEY (`sharedToName`) REFERENCES `User`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_modelGroupId_fkey` FOREIGN KEY (`modelGroupId`) REFERENCES `ModelGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
