import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";

export default async function AdminBannersPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return <div>Unauthorized</div>;

    const banners = await prisma.banner.findMany({
        orderBy: { sortOrder: "asc" }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">จัดการแบนเนอร์ (Banner Management)</h1>
                <Link href="/admin/banners/new">
                    <Button><Plus className="w-4 h-4 mr-2" /> เพิ่มแบนเนอร์</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-3">รูปภาพ</th>
                            <th className="px-6 py-3">หัวข้อ</th>
                            <th className="px-6 py-3">สถานะ</th>
                            <th className="px-6 py-3">ลำดับ</th>
                            <th className="px-6 py-3 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    ยังไม่มีแบนเนอร์
                                </td>
                            </tr>
                        ) : (
                            banners.map(banner => (
                                <tr key={banner.id} className="border-b">
                                    <td className="px-6 py-4">
                                        <div className="relative w-32 h-16 rounded overflow-hidden">
                                            <Image src={banner.imageUrl} alt={banner.title || 'Banner'} fill className="object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{banner.title || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {banner.isActive ? 'ใช้งาน' : 'ซ่อน'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{banner.sortOrder}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/banners/${banner.id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
