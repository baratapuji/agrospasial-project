/*
  Warnings:

  - A unique constraint covering the columns `[owner_id]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TierType" AS ENUM ('SILVER', 'GOLD', 'LUXURY');

-- DropForeignKey
ALTER TABLE "Shop" DROP CONSTRAINT "Shop_owner_id_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "is_highlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "weight_grams" SET DEFAULT 1000,
ALTER COLUMN "stock" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
ADD COLUMN     "onboarding_step" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tier" "TierType" NOT NULL DEFAULT 'SILVER',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shop_owner_id_key" ON "Shop"("owner_id");

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
