"use client";

import { useState } from "react";
import { CustomerProfile, Order, OrderItem, Product } from "@prisma/client";
import { ArrowLeft, User, Phone, Building2, Calendar, ShoppingBag, DollarSign, MapPin, Edit } from "lucide-react";
import Link from "next/link";
import { updateCustomer } from "@/actions/customers";

type OrderWithItems = Order & {
    items: (OrderItem & { Product: Product })[];
};

type ExtendedCustomer = CustomerProfile & {
    Orders: OrderWithItems[]; // Changed to Orders array
};

interface Props {
    customer: ExtendedCustomer;
}

export function CustomerDetailClient({ customer: initialCustomer }: Props) {
    const [customer, setCustomer] = useState(initialCustomer);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nickname: customer.nickname || "", // Changed to nickname
        phone: customer.phone || "",
        department: customer.department || "",
        lineUserId: customer.lineUserId || ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate stats
    const totalOrders = customer.Orders.length;
    const totalSpent = customer.Orders.reduce((sum, order) => sum + Number(order.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Status color helper
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string; label: string }> = {
            PENDING: { bg: "bg-orange-100", text: "text-orange-800", label: "รอชำระ" },
            PAID: { bg: "bg-blue-100", text: "text-blue-800", label: "จ่ายแล้ว" },
            READY: { bg: "bg-purple-100", text: "text-purple-800", label: "พร้อมส่ง" },
            DELIVERED: { bg: "bg-green-100", text: "text-green-800", label: "ส่งแล้ว" },
            COMPLETED: { bg: "bg-gray-100", text: "text-gray-800", label: "เสร็จสิ้น" }
        };
        const s = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${s.bg} ${s.text}`}>
                {s.label}
            </span>
        );
    };

    const handleOpenEdit = () => {
        setFormData({
            nickname: customer.nickname || "",
            phone: customer.phone || "",
            department: customer.department || "",
            lineUserId: customer.lineUserId || ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await updateCustomer(customer.id, formData);
            if (result.success && result.customer) {
                setCustomer({
                    ...result.customer!,
                    Orders: customer.Orders // Preserve orders
                } as ExtendedCustomer);
                setIsModalOpen(false);
            } else {
                alert(result.error || "เกิดข้อผิดพลาด");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayName = customer.nickname || "ไม่ระบุชื่อ";

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Back Button */}
            <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                กลับไปหน้าลูกค้า
            </Link>

            {/* Customer Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 relative">
                <button
                    onClick={handleOpenEdit}
                    className="absolute top-6 right-6 text-gray-400 hover:text-blue-600"
                    title="แก้ไขข้อมูล"
                >
                    <Edit className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span className="font-mono">{customer.phone || "-"}</span>
                            </div>
                            {customer.department && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="h-4 w-4" />
                                    <span>{customer.department}</span>
                                </div>
                            )}
                            {customer.lineUserId && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <span className="font-semibold">LINE User ID:</span>
                                    <span className="font-mono text-xs">{customer.lineUserId}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>สมาชิกตั้งแต่: {new Date(customer.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">จำนวนครั้งที่สั่ง</p>
                            <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                        </div>
                        <ShoppingBag className="h-10 w-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">มูลค่ารวมทั้งหมด</p>
                            <p className="text-3xl font-bold text-green-600">฿{totalSpent.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-10 w-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">มูลค่าเฉลี่ย/ครั้ง</p>
                            <p className="text-3xl font-bold text-purple-600">฿{avgOrderValue.toFixed(0)}</p>
                        </div>
                        <DollarSign className="h-10 w-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">ประวัติการสั่งซื้อ</h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {customer.Orders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>ยังไม่มีประวัติการสั่งซื้อ</p>
                        </div>
                    ) : (
                        customer.Orders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                #{order.orderNumber || order.id.slice(-6)}
                                            </h3>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            ฿{Number(order.total).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2 mb-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                            <div className="flex-1">
                                                <span className="text-gray-900 font-medium">
                                                    {item.Product.name}
                                                </span>
                                                {item.options && (() => {
                                                    try {
                                                        const opts = JSON.parse(item.options);
                                                        let details = "";
                                                        if (opts.sweetness) details += ` หวาน ${opts.sweetness}`;
                                                        if (opts.addons && Array.isArray(opts.addons) && opts.addons.length > 0) {
                                                            details += ` + ${opts.addons.join(", ")}`;
                                                        }
                                                        return <span className="text-orange-600 block text-xs">{details}</span>;
                                                    } catch (e) { return null; }
                                                })()}
                                                <span className="text-gray-500 text-xs ml-1">x{item.quantity}</span>
                                            </div>
                                            <span className="text-gray-900 font-semibold">
                                                ฿{Number(item.price).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Info */}
                                {order.deliveryType && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4" />
                                        <span className="font-semibold">{order.deliveryType}:</span>
                                        <span>{order.deliveryLocation || "-"}</span>
                                    </div>
                                )}

                                {/* Special Instructions */}
                                {(order as any).specialInstructions && (
                                    <div className="mt-2 bg-yellow-50 border-l-2 border-yellow-500 p-2 rounded text-sm">
                                        <span className="font-semibold text-yellow-800">📝 คำสั่งพิเศษ: </span>
                                        <span className="text-yellow-900">{(order as any).specialInstructions}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">แก้ไขข้อมูลลูกค้า</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="ระบุชื่อลูกค้า"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    เบอร์โทรศัพท์
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="0812345678"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    ซอย (Soi)
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="เช่น ซอย 1, ซอย 2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    LINE User ID
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">ID</span>
                                    <input
                                        type="text"
                                        value={formData.lineUserId}
                                        onChange={(e) => setFormData({ ...formData, lineUserId: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="ไอดีไลน์ (ไม่บังคับ)"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกแก้ไข"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
