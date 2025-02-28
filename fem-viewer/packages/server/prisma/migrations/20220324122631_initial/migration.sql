-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelGroup` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelGroupsOnUsers` (
    `modelGroupId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `viewable` BOOLEAN NOT NULL,
    `uploadable` BOOLEAN NOT NULL,

    PRIMARY KEY (`modelGroupId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ModelGroupsOnUsers` ADD CONSTRAINT `ModelGroupsOnUsers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelGroupsOnUsers` ADD CONSTRAINT `ModelGroupsOnUsers_modelGroupId_fkey` FOREIGN KEY (`modelGroupId`) REFERENCES `ModelGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
