-- Phase 3: Add new columns to Order table and create CartSession table
-- Run this in Neon SQL Editor or via psql

-- Add new columns to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "queueNumber" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "lineUserId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryType" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryLocation" TEXT;

-- Create CartSession table for LINE cart management
CREATE TABLE IF NOT EXISTS "CartSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lineUserId" TEXT NOT NULL UNIQUE,
    "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "state" TEXT,
    "tempData" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "CartSession_lineUserId_idx" ON "CartSession"("lineUserId");

-- Done!
SELECT 'Phase 3 schema migration completed!' AS status;
