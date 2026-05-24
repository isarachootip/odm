"use client";

import { useState } from "react";
import { Order, User, OrderItem, Product } from "@prisma/client";
import { OrderStatusSelector } from "./OrderStatusSelector";
import { ShipmentDialog } from "./ShipmentDialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowUpDown, Download, Printer } from "lucide-react";

type ExtendedOrder = Order & {
    User: User | null;
    items: (OrderItem & { Product: Product })[];
    orderNumber?: string | null;
    labelPrintedAt?: Date | null;
};

interface Props {
    initialOrders: ExtendedOrder[];
}

const ITEMS_PER_PAGE = 30;

const formatOptions = (optionsStr: string | null) => {
    if (!optionsStr) return "";
    try {
        const options = JSON.parse(optionsStr);
        const parts: string[] = [];
        // Legacy
        if (options.sweetness) parts.push(`หวาน: ${options.sweetness}`);
        if (Array.isArray(options.addons) && options.addons.length > 0) parts.push(`+ ${options.addons.join(", ")}`);
        // Generic
        Object.entries(options).forEach(([k, v]) => {
            if (k !== 'sweetness' && k !== 'addons' && v && v !== 'none') {
                // Format key if needed, or just show Value
                // Showing Key: Value is safer
                parts.push(`${k}: ${v}`);
            }
        });
        return parts.length > 0 ? `(${parts.join(", ")})` : "";
    } catch (e) {
        return "";
    }
};

export function OrderManagement({ initialOrders }: Props) {
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<"queueNumber" | "customerName" | "deliveryLocation" | "createdAt">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Calculate date range (15 days back from selected date)
    const fifteenDaysAgo = new Date(selectedDate);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Filter Logic
    const filteredOrders = initialOrders.filter(order => {
        // Status Filter
        if (filterStatus !== "ALL" && order.status !== filterStatus) return false;

        // Date Range Filter (last 15 days from selected date)
        const orderDate = new Date(order.createdAt);
        const selected = new Date(selectedDate);
        selected.setHours(23, 59, 59, 999); // Set to end of day

        if (orderDate > selected || orderDate < fifteenDaysAgo) return false;

        return true;
    });

    // Sort Logic
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case "queueNumber":
                const qA = a.queueNumber || 0;
                const qB = b.queueNumber || 0;
                comparison = qA - qB;
                break;
            case "customerName":
                const nameA = a.customerName || a.User?.name || "";
                const nameB = b.customerName || b.User?.name || "";
                comparison = nameA.localeCompare(nameB);
                break;
            case "deliveryLocation":
                const locA = a.deliveryLocation || "";
                const locB = b.deliveryLocation || "";
                comparison = locA.localeCompare(locB);
                break;
            case "createdAt":
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = sortedOrders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const formatDateTime = (date: Date | string) => {
        return new Date(date).toLocaleString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDeliveryBadge = (type: string | null, location: string | null) => {
        if (!type) return null;

        if (type === 'PICKUP') {
            return (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
                    รับเอง
                </span>
            );
        }

        return (
            <div className="flex flex-col gap-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                    จัดส่ง
                </span>
                {location && (
                    <span className="text-[9px] text-gray-500">📍 {location}</span>
                )}
            </div>
        );
    };

    const printOrderLabel = (order: ExtendedOrder) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsList = order.items.map(item => {
            const options = formatOptions(item.options);
            return `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ddd;">
                <div>
                    <span>${item.Product.name}</span>
                    ${options ? `<div style="font-size: 10px; color: #666; margin-left: 5px;">${options}</div>` : ''}
                </div>
                <span style="font-weight: bold;">x${item.quantity}</span>
            </div>`;
        }).join('');

        const customerInfo = order.customerName || order.User?.name || 'Guest';
        const phone = order.customerPhone ? `📞 ${order.customerPhone}` : '';
        const deliveryInfo = order.deliveryType === 'PICKUP'
            ? '🏪 รับเอง'
            : `🚚 จัดส่ง${order.deliveryLocation ? `: ${order.deliveryLocation}` : ''}`;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Order Label - ${order.orderNumber || order.id.slice(-6)}</title>
                <style>
                    @media print {
                        @page { margin: 0.5cm; }
                        body { margin: 0; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                        max-width: 10cm;
                        margin: 0 auto;
                    }
                    .label {
                        border: 2px solid #000;
                        padding: 15px;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .order-number {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    .queue-number {
                        display: inline-block;
                        background: #FFD700;
                        color: #000;
                        font-size: 20px;
                        font-weight: bold;
                        padding: 8px 15px;
                        border-radius: 50%;
                        margin: 10px 0;
                    }
                    .section {
                        margin: 10px 0;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .section-title {
                        font-weight: bold;
                        color: #666;
                        font-size: 11px;
                        margin-bottom: 5px;
                    }
                    .customer-name {
                        font-size: 16px;
                        font-weight: bold;
                    }
                    .items {
                        margin: 10px 0;
                    }
                    .total {
                        text-align: right;
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 2px solid #000;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px dashed #999;
                        font-size: 10px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="header">
                        <div style="font-size: 18px; font-weight: bold;">JOY CAFE</div>
                        <div class="order-number">#${order.orderNumber || order.id.slice(-6).toUpperCase()}</div>
                        ${order.queueNumber ? `<div class="queue-number">${order.queueNumber}</div>` : ''}
                        <div style="font-size: 10px; color: #666;">${new Date(order.createdAt).toLocaleString('th-TH')}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">ลูกค้า</div>
                        <div class="customer-name">${customerInfo}</div>
                        ${phone ? `<div style="font-size: 12px; color: #666;">${phone}</div>` : ''}
                    </div>

                    <div class="section">
                        <div class="section-title">การรับสินค้า</div>
                        <div style="font-size: 14px;">${deliveryInfo}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">รายการสินค้า</div>
                        <div class="items">
                            ${itemsList}
                        </div>
                    </div>

                    <div class="total">
                        ยอดรวม: ฿${Number(order.total).toLocaleString()}
                    </div>

                    <div class="footer">
                        <div>ขอบคุณที่ใช้บริการ 🙏</div>
                        <div>www.joy-cafe.com</div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        // Delay to allow print dialog to open before closing
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Record print timestamp
        fetch('/api/orders/mark-printed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id })
        }).catch(err => console.error('Failed to record print:', err));
    };

    // Dates for dropdown (last 15 days)
    const dateOptions = [];
    for (let i = 0; i <= 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dateOptions.push(date.toISOString().split('T')[0]);
    }

    return (
        <div className="space-y-6 bg-yellow-50 min-h-screen p-6">

            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* Date Picker */}
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-white w-fit">
                        <CalendarIcon size={16} className="text-gray-500" />
                        <select
                            className="text-sm text-gray-700 outline-none cursor-pointer bg-transparent"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            {dateOptions.map(date => (
                                <option key={date} value={date}>
                                    {new Date(date).toLocaleDateString('th-TH', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Showing: Last 15 days from selected date</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="h-10 pl-3 pr-8 rounded-md border text-sm focus:ring-2 focus:ring-yellow-400/50 outline-none cursor-pointer bg-white"
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">Status: All</option>
                        <option value="PENDING">รอรับ</option>
                        <option value="PAID">รับออเดอร์</option>
                        <option value="PROCESSING">กำลังทำ</option>
                        <option value="SHIPPED">เสร็จแล้ว</option>
                        <option value="COMPLETED">จบงาน</option>
                        <option value="CANCELLED">ยกเลิก</option>
                    </select>
                    <span className="text-xs text-gray-600">
                        Total: {sortedOrders.length} orders
                    </span>
                    <button
                        onClick={() => {
                            // 1. Define Headers
                            const headers = ["Order No.", "Date", "Customer", "Phone", "Items", "Total", "Status", "Type", "Location"];

                            // 2. Map Data
                            const rows = filteredOrders.map(order => [
                                order.orderNumber || order.id,
                                new Date(order.createdAt).toLocaleString('th-TH'),
                                `"${order.customerName || order.User?.name || 'Guest'}"`,
                                `"\t${order.customerPhone || ''}"`,
                                `"${order.items.map(i => `${i.Product.name} x${i.quantity}`).join(', ')}"`,
                                order.total,
                                order.status,
                                order.deliveryType,
                                `"${order.deliveryLocation || ''}"`
                            ]);

                            // 3. Convert to CSV String with BOM for Excel Thai support
                            const csvContent = "\uFEFF" +
                                [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

                            // 4. Create Blob and Download
                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-yellow-50/80 border-b border-yellow-100 text-gray-600 font-medium uppercase text-xs tracking-wider">
                            <tr>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-yellow-100 select-none"
                                    onClick={() => handleSort("queueNumber")}
                                >
                                    <div className="flex items-center gap-1">
                                        Queue
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-yellow-100 select-none"
                                    onClick={() => handleSort("createdAt")}
                                >
                                    <div className="flex items-center gap-1">
                                        Date/Time
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3">Order ID</th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-yellow-100 select-none"
                                    onClick={() => handleSort("customerName")}
                                >
                                    <div className="flex items-center gap-1">
                                        Customer
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3">Items</th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-yellow-100 select-none"
                                    onClick={() => handleSort("deliveryLocation")}
                                >
                                    <div className="flex items-center gap-1">
                                        Type / Location
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Slip</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-yellow-50/30 transition-colors">
                                        {/* QUEUE NUMBER */}
                                        <td className="px-4 py-3">
                                            {order.queueNumber ? (
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-gray-900 font-bold text-sm">
                                                    {order.queueNumber}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* DATE/TIME */}
                                        <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                                            {formatDateTime(order.createdAt)}
                                        </td>

                                        {/* ORDER ID */}
                                        <td className="px-4 py-3 font-mono text-gray-700 text-xs">
                                            #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                                        </td>

                                        {/* CUSTOMER */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {order.customerName || order.User?.name || "Guest"}
                                                </span>
                                                {order.customerPhone && (
                                                    <span className="text-[10px] text-gray-500">📞 {order.customerPhone}</span>
                                                )}
                                                {order.lineUserId && (
                                                    <span className="text-[9px] text-blue-500">LINE Order</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ITEMS */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex flex-col gap-0.5">
                                                        <div className="text-gray-700 text-xs flex items-center gap-1">
                                                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                                            <span className="truncate">{item.Product.name}</span>
                                                            <span className="text-gray-400">x{item.quantity}</span>
                                                        </div>
                                                        {item.options && (
                                                            <span className="text-[10px] text-gray-500 pl-2 truncate block">
                                                                {formatOptions(item.options)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <span className="text-[10px] text-gray-400">+{order.items.length - 2} more</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* DELIVERY TYPE / LOCATION */}
                                        <td className="px-4 py-3">
                                            {getDeliveryBadge(order.deliveryType, order.deliveryLocation)}
                                        </td>

                                        {/* TOTAL */}
                                        <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                                            ฿{Number(order.total).toLocaleString()}
                                        </td>

                                        {/* SLIP */}
                                        <td className="px-4 py-3">
                                            {order.paymentSlipUrl ? (
                                                <a
                                                    href={order.paymentSlipUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 underline text-xs flex items-center gap-1"
                                                >
                                                    View Slip
                                                </a>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-3">
                                            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {/* Print Label Button */}
                                                <button
                                                    onClick={() => printOrderLabel(order)}
                                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${order.labelPrintedAt
                                                        ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                                        : 'text-white bg-blue-600 hover:bg-blue-700'
                                                        }`}
                                                    title={order.labelPrintedAt ? `Reprint (Last: ${new Date(order.labelPrintedAt).toLocaleString('th-TH')})` : 'Print Label'}
                                                >
                                                    <Printer size={14} />
                                                    <span>{order.labelPrintedAt ? 'Reprint' : 'Print'}</span>
                                                </button>

                                                {/* Ship Button */}
                                                {["PAID", "PROCESSING"].includes(order.status) && (
                                                    <ShipmentDialog
                                                        orderId={order.id}
                                                        customerName={order.customerName || order.User?.name || "Guest"}
                                                        customerPhone={order.customerPhone || ""}
                                                        deliveryLocation={order.deliveryLocation || ""}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="text-xs text-gray-500">
                            Showing {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, sortedOrders.length)} of {sortedOrders.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
