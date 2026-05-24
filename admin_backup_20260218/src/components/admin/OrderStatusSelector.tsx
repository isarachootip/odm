
"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/actions/order-status";
import { Loader2 } from "lucide-react";

interface Props {
    orderId: string;
    currentStatus: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Pending (รอรับออเดอร์)", color: "text-yellow-700", bg: "bg-yellow-50" },
    PAID: { label: "Confirmed (รับออเดอร์)", color: "text-blue-700", bg: "bg-blue-50" },
    PROCESSING: { label: "Processing (กำลังทำ)", color: "text-orange-700", bg: "bg-orange-50" },
    SHIPPED: { label: "Ready (เสร็จแล้ว)", color: "text-purple-700", bg: "bg-purple-50" }, // Mapping SHIPPED to Ready
    COMPLETED: { label: "Completed (จบงาน)", color: "text-green-700", bg: "bg-green-50" },
    CANCELLED: { label: "Cancelled (ยกเลิก)", color: "text-red-700", bg: "bg-red-50" },
};

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
    const [loading, setLoading] = useState(false);

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus) return;
        setLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

    return (
        <div className="relative w-[180px]">
            <select
                disabled={loading}
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className={`
                    w-full appearance-none cursor-pointer rounded-md border-0 py-2 pl-3 pr-8 text-xs font-bold ring-1 ring-inset focus:ring-2 sm:leading-6
                    ${currentConfig.bg} ${currentConfig.color} ring-transparent hover:ring-gray-200 transition-shadow
                `}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                }}
            >
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status} className="bg-white text-gray-900 font-normal">
                        {config.label}
                    </option>
                ))}
            </select>
            {loading && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                </div>
            )}
        </div>
    );
}
