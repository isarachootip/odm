"use client";

import { useState } from "react";
import { Product, Category } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Edit, Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { ProductDeleteButton } from "./ProductDeleteButton";

type ExtendedProduct = Product & {
    Category: Category | null;
};

interface Props {
    initialProducts: ExtendedProduct[];
    categories: Category[];
}

const ITEMS_PER_PAGE = 20;

export function ProductManagementClient({ initialProducts, categories }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("ALL");
    const [sortField, setSortField] = useState<"name" | "price" | "category">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [tempSearch, setTempSearch] = useState("");

    // Filter Logic
    const filteredProducts = initialProducts.filter(product => {
        // Search filter
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Category filter
        if (filterCategory !== "ALL" && product.categoryId !== filterCategory) {
            return false;
        }

        return true;
    });

    // Sort Logic
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "price":
                comparison = Number(a.price) - Number(b.price);
                break;
            case "category":
                const catA = a.Category?.name || "";
                const catB = b.Category?.name || "";
                comparison = catA.localeCompare(catB);
                break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = sortedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handleSort = (field: "name" | "price" | "category") => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(tempSearch);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 bg-gray-50/50 min-h-screen p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Product Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage your store's products ({sortedProducts.length} of {initialProducts.length} items)
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <button className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-all bg-[#EAB308] text-white hover:bg-[#CA8A04] h-11 px-6 shadow-md">
                        + Add New Product
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by product name... (Press Enter)"
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none"
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                        />
                    </div>
                </form>

                {/* Category Filter */}
                <select
                    className="px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 outline-none cursor-pointer bg-white min-w-[200px]"
                    value={filterCategory}
                    onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="ALL">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8f9fa] text-xs uppercase text-gray-500 font-bold tracking-wider border-b">
                            <tr>
                                <th className="px-6 py-5 w-[100px]">Image</th>
                                <th
                                    className="px-6 py-5 cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-2">
                                        Product Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("category")}
                                >
                                    <div className="flex items-center gap-2">
                                        Category
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-5 cursor-pointer hover:bg-gray-100 select-none"
                                    onClick={() => handleSort("price")}
                                >
                                    <div className="flex items-center gap-2">
                                        Price
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                                        <p className="font-medium">No products found</p>
                                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-yellow-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="h-20 w-20 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200">
                                                {product.images && product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300 text-[10px]">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className="font-bold text-gray-900 text-base">{product.name}</span>
                                                <span className="font-mono text-[10px] text-gray-400">ID: {product.id.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                {product.Category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-lg">
                                                ฿{Number(product.price).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>
                                                </Link>
                                                <ProductDeleteButton id={product.id} />
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
                            Showing {startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, sortedProducts.length)} of {sortedProducts.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
