"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createTable, updateTable, deleteTable } from "@/actions/tables";
import { toast } from "sonner";
import { DiningTable } from "@prisma/client";

interface Props {
    initialTables: DiningTable[];
}

export function TablesClient({ initialTables }: Props) {
    const [tables, setTables] = useState<DiningTable[]>(initialTables);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        capacity: 4,
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenCreate = () => {
        setEditingTable(null);
        setFormData({ name: "", capacity: 4, isActive: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (table: DiningTable) => {
        setEditingTable(table);
        setFormData({
            name: table.name,
            capacity: table.capacity,
            isActive: table.isActive
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingTable) {
                const result = await updateTable(editingTable.id, formData);
                if (result.success && result.table) {
                    setTables(tables.map(t => t.id === result.table!.id ? result.table! : t));
                    setIsModalOpen(false);
                    toast.success("อัปเดตโต๊ะเรียบร้อยแล้ว");
                } else {
                    toast.error(result.error || "เกิดข้อผิดพลาด");
                }
            } else {
                const result = await createTable(formData);
                if (result.success && result.table) {
                    setTables([...tables, result.table!]);
                    setIsModalOpen(false);
                    toast.success("เพิ่มโต๊ะใหม่เรียบร้อยแล้ว");
                } else {
                    toast.error(result.error || "เกิดข้อผิดพลาด");
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`แน่ใจหรือไม่ว่าต้องการลบโต๊ะ: ${name}?`)) return;
        
        try {
            const result = await deleteTable(id);
            if (result.success) {
                setTables(tables.filter(t => t.id !== id));
                toast.success("ลบโต๊ะเรียบร้อยแล้ว");
            } else {
                toast.error(result.error || "เกิดข้อผิดพลาดในการลบ");
            }
        } catch (error) {
            toast.error("ล้มเหลว");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">จัดการโต๊ะ (Dining Tables)</h2>
                <button
                    onClick={handleOpenCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    เพิ่มโต๊ะใหม่
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">ชื่อโต๊ะ</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">จำนวนที่นั่ง</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tables.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    ยังไม่มีข้อมูลโต๊ะ
                                </td>
                            </tr>
                        ) : (
                            tables.map(table => (
                                <tr key={table.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{table.name}</td>
                                    <td className="px-6 py-4">{table.capacity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${table.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {table.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleOpenEdit(table)} className="text-blue-600 hover:text-blue-800 mr-3">
                                            <Edit className="h-4 w-4 inline" />
                                        </button>
                                        <button onClick={() => handleDelete(table.id, table.name)} className="text-red-600 hover:text-red-800">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">
                            {editingTable ? "แก้ไขโต๊ะ" : "เพิ่มโต๊ะใหม่"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">ชื่อโต๊ะ / หมายเลขโต๊ะ</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="เช่น Table 1, โต๊ะ A1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">จำนวนที่นั่ง</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm">เปิดใช้งาน (แสดงให้ลูกค้าเลือกได้)</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg">ยกเลิก</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                                    {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
