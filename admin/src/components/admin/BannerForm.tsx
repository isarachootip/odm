"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function BannerForm({ initialData = null }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        imageUrl: initialData?.imageUrl || "",
        subtitle: initialData?.subtitle || "",
        title: initialData?.title || "",
        description: initialData?.description || "",
        buttonText: initialData?.buttonText || "",
        buttonLink: initialData?.buttonLink || "",
        isActive: initialData?.isActive ?? true,
        sortOrder: initialData?.sortOrder || 0,
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append("file", file);

            const res = await fetch("/api/upload/logo", { method: "POST", body: data });
            const result = await res.json().catch(() => ({}));
            
            if (!res.ok) {
                throw new Error(result.error || "Upload failed");
            }
            
            setFormData(prev => ({ ...prev, imageUrl: result.url }));
        } catch (error: any) {
            console.error(error);
            alert(`Failed to upload image: ${error.message || 'Upload failed'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) return alert("Please upload an image");

        try {
            setLoading(true);
            const url = initialData ? `/api/admin/banners/${initialData.id}` : "/api/admin/banners";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save banner");
            
            router.push("/admin/banners");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save banner");
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !confirm("Are you sure you want to delete this banner?")) return;
        
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/banners/${initialData.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            
            router.push("/admin/banners");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to delete banner");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium mb-2">รูปภาพแบนเนอร์ (Background Image) *</label>
                <div className="flex gap-4 items-center">
                    <div className="relative w-48 h-24 bg-gray-100 rounded overflow-hidden border">
                        {formData.imageUrl ? (
                            <Image src={formData.imageUrl} alt="Banner" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No Image</div>
                        )}
                    </div>
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-gray-100 border rounded text-sm hover:bg-gray-200">
                            {uploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพ"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">หัวข้อรอง (Subtitle) - สีเหลือง</label>
                    <input type="text" className="w-full p-2 border rounded" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="เช่น เมนูแนะนำ" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">หัวข้อหลัก (Title) - สีขาวตัวใหญ่</label>
                    <input type="text" className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น สัมผัสรสชาติอาหารไทยแท้" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">รายละเอียด (Description) - สีขาวตัวเล็ก</label>
                    <textarea className="w-full p-2 border rounded" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="เช่น ลิ้มลองเมนูเด็ดอย่างข้าวผัดกะเพรา..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">ข้อความปุ่ม (Button Text)</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="เช่น สั่งอาหารเลย" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ลิงก์ปุ่ม (Button Link)</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.buttonLink} onChange={e => setFormData({...formData, buttonLink: e.target.value})} placeholder="เช่น /products" />
                    </div>
                </div>
                <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                        <span className="text-sm font-medium">เปิดใช้งาน (Active)</span>
                    </label>
                    <div>
                        <label className="text-sm font-medium mr-2">ลำดับ (Sort Order)</label>
                        <input type="number" className="w-20 p-1 border rounded text-sm" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
                {initialData ? (
                    <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded font-medium">
                        ลบแบนเนอร์
                    </button>
                ) : <div/>}
                
                <div className="flex gap-2">
                    <button type="button" onClick={() => router.push("/admin/banners")} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium">
                        ยกเลิก
                    </button>
                    <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium">
                        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                </div>
            </div>
        </form>
    );
}
