"use client";

import { useState, useEffect } from "react";
import { Order, User, OrderItem, Product } from "@prisma/client";
import { Printer, CheckCircle, Clock } from "lucide-react";

type ExtendedOrder = Order & {
    User: User | null;
    items: (OrderItem & { Product: Product })[];
    orderNumber?: string | null;
    labelPrintedAt?: Date | null;
};

export default function PrintDashboard() {
    const [orders, setOrders] = useState<ExtendedOrder[]>([]);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());
    const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);
    const [printHistory, setPrintHistory] = useState<string[]>([]);

    // Fetch new orders
    const fetchNewOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const data = await response.json();

            // Filter only PAID orders that haven't been printed yet
            const newOrders = data.filter((order: ExtendedOrder) =>
                order.status === 'PAID' && !order.labelPrintedAt
            );

            // Auto-print new orders
            if (autoPrintEnabled) {
                newOrders.forEach((order: ExtendedOrder) => {
                    if (!printHistory.includes(order.id)) {
                        printOrderLabel(order);
                        setPrintHistory(prev => [...prev, order.id]);
                    }
                });
            }

            setOrders(newOrders);
            setLastChecked(new Date());
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Print function
    const printOrderLabel = (order: ExtendedOrder) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsList = order.items.map(item =>
            `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ddd;">
                <span>${item.Product.name}</span>
                <span style="font-weight: bold;">x${item.quantity}</span>
            </div>`
        ).join('');

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
        }).then(() => fetchNewOrders()); // Refresh list
    };

    // Poll for new orders every 10 seconds
    useEffect(() => {
        fetchNewOrders(); // Initial fetch

        const interval = setInterval(() => {
            fetchNewOrders();
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [autoPrintEnabled, printHistory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Printer className="text-blue-600" size={32} />
                                Auto Print Dashboard
                            </h1>
                            <p className="text-gray-600 mt-1">เปิดหน้านี้ทิ้งไว้เพื่อพิมพ์ใบแปะสินค้าอัตโนมัติ</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Auto Print Toggle */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm font-medium text-gray-700">Auto Print</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={autoPrintEnabled}
                                        onChange={(e) => setAutoPrintEnabled(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-14 h-8 rounded-full transition-colors ${autoPrintEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${autoPrintEnabled ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                            </label>

                            {/* Status */}
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock size={16} />
                                <span>Last check: {lastChecked.toLocaleTimeString('th-TH')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.length === 0 ? (
                        <div className="col-span-full bg-white rounded-lg p-12 text-center">
                            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่มี Order รอพิมพ์</h3>
                            <p className="text-gray-500">ระบบจะพิมพ์อัตโนมัติเมื่อมี Order ใหม่เข้ามา</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                                    <div>
                                        <div className="font-bold text-lg">#{order.orderNumber || order.id.slice(-6)}</div>
                                        {order.queueNumber && (
                                            <div className="inline-block bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm mt-1">
                                                คิว {order.queueNumber}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleString('th-TH')}
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600">ลูกค้า</div>
                                    <div className="font-semibold">{order.customerName || order.User?.name || 'Guest'}</div>
                                    {order.customerPhone && (
                                        <div className="text-xs text-gray-500">📞 {order.customerPhone}</div>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 mb-1">รายการ</div>
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="text-sm flex justify-between">
                                            <span>{item.Product.name}</span>
                                            <span className="font-medium">x{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className="text-xs text-gray-400">+{order.items.length - 2} more</div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="font-bold text-lg">฿{Number(order.total).toLocaleString()}</span>
                                    <button
                                        onClick={() => printOrderLabel(order)}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <Printer size={14} />
                                        Print Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
