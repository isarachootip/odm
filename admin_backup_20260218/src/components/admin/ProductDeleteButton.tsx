"use client";

import { deleteProduct } from "@/actions/admin-product";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

export function ProductDeleteButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        setLoading(true);
        await deleteProduct(id);
        setLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
            title="Delete Product"
        >
            <Trash className="w-3.5 h-3.5" />
            {loading ? "..." : "Delete"}
        </button>
    );
}
