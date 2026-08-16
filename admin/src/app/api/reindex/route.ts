import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const startTime = Date.now();
    const results: Array<{ name: string; status: string; error?: string }> = [];

    const indexQueries = [
        // Order indexes
        `CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");`,
        `CREATE INDEX IF NOT EXISTS "Order_branchId_createdAt_idx" ON "Order"("branchId", "createdAt");`,
        `CREATE INDEX IF NOT EXISTS "Order_lineUserId_idx" ON "Order"("lineUserId");`,
        `CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");`,
        `CREATE INDEX IF NOT EXISTS "Order_deliveryType_idx" ON "Order"("deliveryType");`,

        // OrderItem indexes
        `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");`,
        `CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");`,

        // Product & Category indexes
        `CREATE INDEX IF NOT EXISTS "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");`,
        `CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");`,

        // Schema migrations (safe if already existing)
        `ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "address" TEXT;`,
        `ALTER TABLE "CustomerProfile" ADD COLUMN IF NOT EXISTS "landmark" TEXT;`,

        // Customer & Session indexes
        `CREATE INDEX IF NOT EXISTS "CustomerProfile_lineUserId_idx" ON "CustomerProfile"("lineUserId");`,
        `CREATE INDEX IF NOT EXISTS "CustomerProfile_phone_idx" ON "CustomerProfile"("phone");`,
        `CREATE INDEX IF NOT EXISTS "CartSession_lineUserId_state_idx" ON "CartSession"("lineUserId", "state");`,
        `CREATE INDEX IF NOT EXISTS "CartSession_updatedAt_idx" ON "CartSession"("updatedAt");`,

        // Table & Reservation indexes
        `CREATE INDEX IF NOT EXISTS "DiningTable_isActive_branchId_idx" ON "DiningTable"("isActive", "branchId");`,
        `CREATE INDEX IF NOT EXISTS "TableReservation_date_timeSlot_status_idx" ON "TableReservation"("date", "timeSlot", "status");`,
        `CREATE INDEX IF NOT EXISTS "TableReservation_tableId_date_idx" ON "TableReservation"("tableId", "date");`,

        // Config indexes
        `CREATE INDEX IF NOT EXISTS "PaymentConfig_isDefault_idx" ON "PaymentConfig"("isDefault");`,
        `CREATE INDEX IF NOT EXISTS "BankConfig_isDefault_idx" ON "BankConfig"("isDefault");`,

        // Reindex & Analyze to update PostgreSQL query planner statistics
        `ANALYZE "Order";`,
        `ANALYZE "OrderItem";`,
        `ANALYZE "Product";`,
        `ANALYZE "CartSession";`,
        `ANALYZE "CustomerProfile";`,
        `ANALYZE "DiningTable";`,
        `ANALYZE "TableReservation";`
    ];

    for (const sql of indexQueries) {
        const queryName = sql.replace(/CREATE INDEX IF NOT EXISTS /i, "INDEX: ").replace(/ANALYZE /i, "ANALYZE: ").replace(/;/g, "");
        try {
            await prisma.$executeRawUnsafe(sql);
            results.push({ name: queryName, status: "OK" });
        } catch (err: any) {
            results.push({ name: queryName, status: "SKIPPED_OR_ERROR", error: err.message });
        }
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
        success: true,
        message: "Database reindexing and performance optimization completed!",
        executionTimeMs: duration,
        totalTasks: indexQueries.length,
        results
    });
}
