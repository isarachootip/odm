"use client";

import { useState, useEffect } from "react";
import { Order, OrderItem, Product, User, Branch } from "@prisma/client";
import { updateOrderStatus } from "@/actions/order-status";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw, CheckCircle, Clock, Truck, CreditCard, Store } from "lucide-react";

type ExtendedOrder = Order & {
    User: User | null;
    items: (OrderItem & { Product: Product })[];
    specialInstructions?: string | null;
    branch?: { id: string, name: string } | null;
};

interface Props {
    initialOrders: ExtendedOrder[];
    addonProducts?: Product[];
    branches: { id: string, name: string }[];
    currentBranchId: string | null;
    isAdmin: boolean;
}

export function QueueMonitor({ initialOrders, addonProducts = [], branches, currentBranchId, isAdmin }: Props) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Read current branch from props (which comes from URL via page.tsx)
    const selectedBranchId = currentBranchId || "";

    // Create a map for normalized addon lookup
    const addonMap = new Map<string, Product>();
    addonProducts.forEach(p => {
        addonMap.set(p.name.trim().toLowerCase(), p);
    });

    // Helper to find addon product
    const findAddonProduct = (name: string) => {
        const normalized = name.trim().toLowerCase();
        const aliasMap: Record<string, string> = {
            "extra shot": "เพิ่มช็อตกาแฟ",
            "extra_shot": "เพิ่มช็อตกาแฟ",
            "honey": "เพิ่มน้ำผึ้ง",
            "syrup": "เพิ่มไซรัป",
            "whipped cream": "เพิ่มวิปครีม",
            "whipped_cream": "เพิ่มวิปครีม"
        };

        const mappedName = aliasMap[normalized];
        if (mappedName) {
            const found = addonMap.get(mappedName);
            if (found) return found;
        }

        return addonMap.get(normalized) || Array.from(addonMap.values()).find(p => normalized.includes(p.name.toLowerCase()));
    };

    // Filter orders by selected branch
    const filteredOrders = selectedBranchId
        ? initialOrders.filter(o => o.branchId === selectedBranchId)
        : initialOrders;

    // Split orders into pending payment vs active
    const pendingOrders = filteredOrders.filter(o => o.status === 'PENDING');
    const activeOrders = filteredOrders.filter(o =>
        ['PAID', 'PROCESSING', 'SHIPPED'].includes(o.status)
    ).sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0));

    useEffect(() => {
        import('bwip-js').then((bwipjs) => {
            try {
                const canvases = document.querySelectorAll('canvas.barcode-canvas');
                canvases.forEach((canvas: any) => {
                    const sku = canvas.dataset.sku;
                    if (sku && !canvas.dataset.rendered) {
                        try {
                            bwipjs.toCanvas(canvas, {
                                bcid: 'ean13',
                                text: sku,
                                scale: 2,
                                height: 10,
                                includetext: true,
                                textxalign: 'center',
                            });
                            canvas.dataset.rendered = 'true';
                        } catch (e) {
                            try {
                                bwipjs.toCanvas(canvas, {
                                    bcid: 'code128',
                                    text: sku,
                                    scale: 2,
                                    height: 10,
                                    includetext: true,
                                    textxalign: 'center',
                                });
                                canvas.dataset.rendered = 'true';
                            } catch (e2) {
                                // silently fail
                            }
                        }
                    }
                });
            } catch (e) {
                console.error("Barcode generation error", e);
            }
        });
    });

    // Auto-refresh every 10 seconds (increased from 5 to reduce load)
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000);
        return () => clearInterval(interval);
    }, [router]);

    const handleStatusUpdate = async (orderId: string, newStatus: "PROCESSING" | "SHIPPED" | "COMPLETED") => {
        setLoadingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
            router.refresh();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        } finally {
            setLoadingId(null);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'PAID': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MonitorIcon /> Queue Monitor
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                        รอชำระ: {pendingOrders.length} | กำลังทำ: {activeOrders.length}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Branch Selector for Admin */}
                    {isAdmin && branches.length > 0 && (
                        <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm">
                            <Store className="w-4 h-4 text-gray-400 mr-2" />
                            <select
                                value={selectedBranchId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        router.push(`?branchId=${val}`);
                                    } else {
                                        router.push('?');
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 outline-none pr-8 cursor-pointer"
                            >
                                <option value="">ทุกสาขา (All Branches)</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>สาขา {b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleRefresh}
                        className="p-2 md:p-3 bg-white border rounded-full hover:bg-gray-100 shadow-sm transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                        disabled={isRefreshing}
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Left: Pending Payment */}
                <div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mb-3 md:mb-4 rounded sticky top-0 z-10">
                        <h2 className="font-bold text-orange-900 flex items-center gap-2 text-sm md:text-base">
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                            รอชำระเงิน ({pendingOrders.length})
                        </h2>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {pendingOrders.length === 0 ? (
                            <div className="text-center py-8 md:py-12 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm md:text-base">ไม่มีรายการรอชำระเงิน</p>
                            </div>
                        ) : (
                            pendingOrders.map(order => (
                                <div key={order.id} className="bg-white rounded-lg p-3 shadow-sm border border-orange-200 relative overflow-hidden">
                                    {/* Branch Indicator line */}
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400"></div>
                                    <div className="pl-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        #{order.orderNumber || order.id.slice(-4)}
                                                    </span>
                                                    {isAdmin && order.branch && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                                                            สาขา {order.branch.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {order.customerName} • {order.customerPhone}
                                                    {order.customerDepartment && ` • ${order.customerDepartment}`}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                รอชำระ
                                            </span>
                                        </div>

                                        {/* Simplified items rendering for space saving since they just have to see the total */}
                                        <div className="space-y-2 mt-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1">
                                                    <span className="text-gray-700 line-clamp-1">{item.Product.name}</span>
                                                    <span className="font-bold text-gray-900 ml-2">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.specialInstructions && (
                                            <div className="bg-yellow-50 border-l-2 border-yellow-500 p-2 rounded mt-2">
                                                <p className="text-xs font-semibold text-yellow-800">📝 {order.specialInstructions}</p>
                                            </div>
                                        )}

                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-sm text-gray-700">ยอดรวม:</span>
                                                <span className="text-lg font-bold text-orange-600">
                                                    ฿{Number(order.total).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Active Orders */}
                <div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded sticky top-0 z-10">
                        <h2 className="font-bold text-blue-900 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            กำลังทำ ({activeOrders.length})
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {activeOrders.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-lg border border-dashed border-gray-200">
                                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>ไม่มีรายการที่กำลังทำ</p>
                            </div>
                        ) : (
                            activeOrders.map(order => (
                                <div key={order.id} className={`bg-white rounded-xl p-4 border relative overflow-hidden hover:shadow-md transition-all ${['SHIPPED'].includes(order.status) ? 'border-green-300 ring-1 ring-green-100' : (order.status === 'PAID' ? 'border-yellow-200 ring-1 ring-yellow-50' : 'border-blue-200')} `}>
                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${['SHIPPED'].includes(order.status) ? 'bg-green-400' : (order.status === 'PAID' ? 'bg-yellow-400' : 'bg-blue-400')}`}></div>
                                    <div className="pl-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-gray-900">Q-{order.queueNumber || '-'}</span>
                                                    {isAdmin && order.branch && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border align-middle">
                                                            {order.branch.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">#{order.orderNumber || order.id.slice(-4)}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mb-4 space-y-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="line-clamp-2 text-gray-800 font-medium leading-tight">{item.Product.name}</span>
                                                    </div>
                                                    <span className="font-bold text-lg text-gray-900 whitespace-nowrap bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Spec Options in Queue Monitor */}
                                        {order.items.some(i => i.options && Object.keys(JSON.parse(i.options)).length > 0) && (
                                            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-3 font-medium">
                                                {order.items.map((item, idxx) => {
                                                    if (!item.options) return null;
                                                    try {
                                                        const opts = JSON.parse(item.options);
                                                        const optStrings = Object.entries(opts)
                                                            .filter(([k, v]) => k !== 'addons' && v && v !== 'none')
                                                            .map(([k, v]) => `${k === 'sweetness' ? 'หวาน ' : ''}${v}`);
                                                        if (optStrings.length === 0) return null;
                                                        return <div key={idxx}>- {item.Product.name}: {optStrings.join(", ")}</div>;
                                                    } catch (e) { return null; }
                                                })}
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 mb-3 pt-2 border-t space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </div>
                                            <div className="font-medium text-gray-700">{order.customerName} {order.customerDepartment ? `(${order.customerDepartment})` : ''}</div>
                                            {order.deliveryType && <div className="text-[10px] text-gray-400 uppercase tracking-wider">{order.deliveryType}</div>}
                                        </div>

                                        {order.status === 'PAID' ? (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                                                disabled={loadingId === order.id}
                                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                {loadingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                                                รับออเดอร์ (Start Cooking)
                                            </button>
                                        ) : order.status === 'PROCESSING' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                                    disabled={loadingId === order.id}
                                                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-1 text-sm"
                                                >
                                                    {loadingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    พร้อมเสิร์ฟ (Dine-in/Pickup)
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                                    disabled={loadingId === order.id}
                                                    className="flex-1 py-2.5 bg-[#FFB800] hover:bg-yellow-500 text-black rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center gap-1 text-sm"
                                                >
                                                    {loadingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                                    ส่งมอบ (Delivery)
                                                </button>
                                            </div>
                                        ) : ['SHIPPED', 'COMPLETED'].includes(order.status) ? (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                disabled={loadingId === order.id || order.status === 'COMPLETED'}
                                                className={`w-full py-2.5 ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded-lg font-bold transition-colors flex items-center justify-center gap-2`}
                                            >
                                                {loadingId === order.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                {order.status === 'COMPLETED' ? 'เสร็จสมบูรณ์แล้ว' : 'เสร็จสมบูรณ์ (Complete)'}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
    );
}
