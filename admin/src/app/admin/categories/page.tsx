import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { deleteCategory } from "@/actions/admin-category";
import { CategoryDeleteButton } from "@/components/admin/CategoryDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return <div>Unauthorized</div>;

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { Product: true } } }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage product categories</p>
                </div>
                <Link href="/admin/categories/new">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500 border border-yellow-500 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="bg-yellow-50/80 border-b border-yellow-100">
                            <tr className="transition-colors hover:bg-yellow-100/50">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Image</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Slug</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Products</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {categories.map((category) => (
                                <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle">
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                                            {category.image ? (
                                                <Image
                                                    src={category.image}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[10px] text-gray-400">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle font-medium">{category.name}</td>
                                    <td className="p-4 align-middle text-muted-foreground">{category.slug}</td>
                                    <td className="p-4 align-middle">{category._count.Product}</td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                                    Edit
                                                </button>
                                            </Link>
                                            <CategoryDeleteButton id={category.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No categories found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
