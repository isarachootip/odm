"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
}

export function CategoryDropdown({ categories }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category") || "";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }

        // Reset page to 1 if pagination exists (optional but good practice)
        // params.delete("page"); 

        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="relative w-full md:w-56">
            <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={currentCategory}
                onChange={handleChange}
            >
                <option value="">หมวดหมู่ทั้งหมด</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
