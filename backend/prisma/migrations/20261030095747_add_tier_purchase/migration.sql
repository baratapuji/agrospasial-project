-- CreateTable
CREATE TABLE "TierPurchase" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" "TierType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "snap_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TierPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TierPurchase_order_id_key" ON "TierPurchase"("order_id");

-- AddForeignKey
ALTER TABLE "TierPurchase" ADD CONSTRAINT "TierPurchase_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
