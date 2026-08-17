import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BannerForm } from "@/components/admin/BannerForm";
import { notFound } from "next/navigation";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return <div>Unauthorized</div>;

    const { id } = await params;

    const banner = await prisma.banner.findUnique({
        where: { id },
    });

    if (!banner) notFound();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">แก้ไขแบนเนอร์</h1>
            <BannerForm initialData={banner} />
        </div>
    );
}
