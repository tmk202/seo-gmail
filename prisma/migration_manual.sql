-- ============================================================
-- MIGRATION: Tạo toàn bộ bảng cho Antigravity Store
-- Chạy file này trong Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hszmrsoxljqbzojpmrwy/sql/new
-- ============================================================

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('AVAILABLE', 'SOLD');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED');

-- CreateTable: Sản phẩm
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Kho tài khoản Gmail
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "recoveryEmail" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Đơn hàng
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Mapping đơn hàng ↔ tài khoản
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");
CREATE UNIQUE INDEX "OrderItem_accountId_key" ON "OrderItem"("accountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- SEED DATA: Tạo 3 sản phẩm mặc định
-- (Sau khi chạy xong phần trên, chạy tiếp phần dưới)
-- ============================================================

INSERT INTO "Product" ("id", "name", "price", "stock", "createdAt", "updatedAt") VALUES
('prod_basic',   'Demo Antigravity - Basic',   15000, 0, NOW(), NOW()),
('prod_premium', 'Demo Antigravity - Premium', 35000, 0, NOW(), NOW()),
('prod_master',  'Demo Antigravity - Master',  90000, 0, NOW(), NOW());
