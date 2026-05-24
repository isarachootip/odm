"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterSidebarProps {
    categories: { id: string; name: string; slug: string }[];
}

const SORT_OPTIONS = [
    { label: "ใหม่ล่าสุด", value: "newest" },
    { label: "ราคา: ต่ำ -> สูง", value: "price_asc" },
    { label: "ราคา: สูง -> ต่ำ", value: "price_desc" },
];

export function FilterSidebar({ categories }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get("min") || "",
        max: searchParams.get("max") || ""
    });

    // Get selected category from URL
    const currentCategory = searchParams.get("category");

    const handleCategoryClick = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === currentCategory) {
            params.delete("category"); // Toggle off
        } else {
            params.set("category", slug);
        }
        router.push(`/products?${params.toString()}`);
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (priceRange.min) params.set("min", priceRange.min);
        else params.delete("min");

        if (priceRange.max) params.set("max", priceRange.max);
        else params.delete("max");

        router.push(`/products?${params.toString()}`);
    };

    return (
        <aside className="w-full space-y-6 lg:w-64">
            <div className="flex items-center gap-2 font-bold text-lg lg:hidden mb-4">
                <Filter className="h-5 w-5" /> ตัวกรองสินค้า
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm tracking-wide text-muted-foreground uppercase">
                    หมวดหมู่สินค้า
                </h3>
                <div className="space-y-2">
                    {categories.length === 0 ? <p className="text-sm text-muted-foreground">ไม่พบหมวดหมู่</p> :
                        categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={currentCategory === category.slug}
                                    onChange={() => handleCategoryClick(category.slug)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                {category.name}
                            </label>
                        ))}
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Price Range */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm tracking-wide text-muted-foreground uppercase">
                    ช่วงราคา
                </h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="ต่ำสุด"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                        type="number"
                        placeholder="สูงสุด"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div className="h-px bg-border" />

            <Button className="w-full" variant="secondary" onClick={applyFilters}>
                ค้นหา
            </Button>
        </aside>
    );
}
