/*
  Warnings:

  - A unique constraint covering the columns `[referral]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Referral_email_key` ON `referral`;

-- CreateIndex
CREATE UNIQUE INDEX `Referral_referral_key` ON `Referral`(`referral`);
