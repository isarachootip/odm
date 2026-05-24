
"use client";

import { deleteCategory } from "@/actions/admin-category";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function CategoryDeleteButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("⚠️ Are you sure you want to delete this category?\nThis action cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteCategory(id);
        } catch (error) {
            alert("Failed to delete category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={loading}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
