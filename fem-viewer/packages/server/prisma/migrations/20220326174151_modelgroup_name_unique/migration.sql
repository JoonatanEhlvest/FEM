/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ModelGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ModelGroup_id_name_idx` ON `ModelGroup`;

-- CreateIndex
CREATE UNIQUE INDEX `ModelGroup_name_key` ON `ModelGroup`(`name`);
