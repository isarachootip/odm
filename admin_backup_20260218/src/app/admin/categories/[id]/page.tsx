import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditCategoryClient from "@/components/admin/CategoryEditForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const category = await prisma.category.findUnique({
        where: { id }
    });

    if (!category) {
        redirect("/admin/categories");
    }

    // Convert Date objects to strings to avoid serialization error
    const plainCategory = JSON.parse(JSON.stringify(category));

    return <EditCategoryClient category={plainCategory} />;
}
