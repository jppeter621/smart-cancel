-- CreateTable
CREATE TABLE "CancelSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "cancellationWindowMinutes" INTEGER NOT NULL DEFAULT 60,
    "allowAddressEdit" BOOLEAN NOT NULL DEFAULT true,
    "allowCancellation" BOOLEAN NOT NULL DEFAULT true,
    "autoRestock" BOOLEAN NOT NULL DEFAULT true,
    "autoRefund" BOOLEAN NOT NULL DEFAULT true,
    "reasonOptions" TEXT NOT NULL DEFAULT 'Changed my mind,Found a better price,Ordered by mistake,Shipping time is too long,Wrong shipping address,Other',
    "retentionDiscountEnabled" BOOLEAN NOT NULL DEFAULT false,
    "retentionDiscountCode" TEXT DEFAULT 'KEEP10',
    "retentionDiscountPercent" INTEGER DEFAULT 10,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "monthlyActionsCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyActionsLimit" INTEGER NOT NULL DEFAULT 25,
    "billingPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CancelAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "actionType" TEXT NOT NULL,
    "reason" TEXT,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CancelSettings_shop_key" ON "CancelSettings"("shop");

-- CreateIndex
CREATE INDEX "CancelAction_shop_createdAt_idx" ON "CancelAction"("shop", "createdAt");
