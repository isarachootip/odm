"use client";

import { useState } from "react";
import { CustomerProfile } from "@prisma/client";
import { Plus, Search, Edit, User, Phone, Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { createCustomer, updateCustomer, deleteCustomer } from "@/actions/customers";
import { toast } from "sonner";

interface ExtendedCustomer extends CustomerProfile {
    _count: {
        Order: number;
    };
    totalSpent: number;
}

interface Props {
    initialCustomers: ExtendedCustomer[];
}

export function CustomersClient({ initialCustomers }: Props) {
    const [customers, setCustomers] = useState(initialCustomers);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<ExtendedCustomer | null>(null);
    const [formData, setFormData] = useState({
        nickname: "",
        phone: "",
        department: "",
        lineUserId: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((sum, c) => sum + c._count.Order, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const filteredCustomers = customers.filter(c =>
        (c.nickname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || "").includes(searchTerm) ||
        (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenCreate = () => {
        setEditingCustomer(null);
        setFormData({ nickname: "", phone: "", department: "", lineUserId: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (customer: ExtendedCustomer) => {
        setEditingCustomer(customer);
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
            if (editingCustomer) {
                // Update
                const result = await updateCustomer(editingCustomer.id, formData);
                if (result.success && result.customer) {
                    // Update local state
                    setCustomers(customers.map(c => c.id === result.customer!.id ? {
                        ...result.customer!,
                        _count: c._count,      // Preserve stats
                        totalSpent: c.totalSpent // Preserve stats
                    } : c));
                    setIsModalOpen(false);
                    toast.success("อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว");
                } else {
                    toast.error(result.error || "เกิดข้อผิดพลาดในการอัปเดต");
                }
            } else {
                // Create
                const result = await createCustomer(formData);
                if (result.success && result.customer) {
                    // Add to local state (stats = 0 for new)
                    const newCustomer = {
                        ...result.customer!,
                        _count: { Order: 0 },
                        totalSpent: 0
                    };
                    setCustomers([newCustomer, ...customers]);
                    setIsModalOpen(false);
                    toast.success("เพิ่มลูกค้าใหม่เรียบร้อยแล้ว");
                } else {
                    toast.error(result.error || "เกิดข้อผิดพลาดในการเพิ่มลูกค้า");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้ (${name || 'ไม่ระบุชื่อ'})?\n\n*ประวัติออเดอร์ของลูกค้าจะยังคงอยู่ในระบบ*`)) {
            return;
        }

        try {
            const result = await deleteCustomer(id);
            if (result.success) {
                setCustomers(customers.filter(c => c.id !== id));
                toast.success("ลบข้อมูลลูกค้าเรียบร้อยแล้ว");
            } else {
                toast.error(result.error || "ลบข้อมูลล้มเหลว");
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">ลูกค้า</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        เพิ่มลูกค้าใหม่
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-6 rounded-lg shadow space-y-2">
                    <div className="text-sm font-medium text-gray-500">ลูกค้าทั้งหมด</div>
                    <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow space-y-2">
                    <div className="text-sm font-medium text-gray-500">ออเดอร์รวม</div>
                    <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow space-y-2">
                    <div className="text-sm font-medium text-gray-500">ยอดใช้จ่ายรวม</div>
                    <div className="text-2xl font-bold text-green-600">฿{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow space-y-2">
                    <div className="text-sm font-medium text-gray-500">เฉลี่ยต่อคน</div>
                    <div className="text-2xl font-bold text-blue-600">฿{avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                    type="text"
                    placeholder="ค้นหาชื่อ, เบอร์โทร, หรือซอย..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">ลูกค้า</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">เบอร์โทร</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">ซอย (Soi)</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-center">ออเดอร์</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-right">ยอดรวม</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    ไม่พบข้อมูลลูกค้า
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="font-medium text-gray-900">{customer.nickname || "ไม่ระบุชื่อ"}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600 text-sm">
                                        {customer.phone || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.department ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {customer.department}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {customer._count.Order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        ฿{customer.totalSpent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOpenEdit(customer);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="แก้ไข"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="ดูรายละเอียด"
                                            >
                                                <Search className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDelete(customer.id, customer.nickname || "ไม่ระบุชื่อ");
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                title="ลบข้อมูล"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">
                            {editingCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
                        </h3>

                        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                            <p className="font-medium mb-1">คำแนะนำในการกรอกข้อมูล</p>
                            <p>ตัวอย่าง: อนุกูน ชื่นใจ (ชื่อ-นามสกุล), SD (แผนก), 0635678899 (เบอร์โทร)</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">ข้อมูลหลัก (Required)</h4>

                                    <div className="grid grid-cols-1 gap-4">
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
                                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                    placeholder="ระบุชื่อลูกค้า"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                    placeholder="0812345678"
                                                    required
                                                    pattern="[0-9]{10}"
                                                    title="กรุณากรอกเบอร์โทร 10 หลัก"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">ข้อมูลเพิ่มเติม (Optional)</h4>

                                    <div className="grid grid-cols-1 gap-4">
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
                                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
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
                                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                                    placeholder="ไอดีไลน์ (ไม่บังคับ)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
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
                                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
