import { auth } from "@/auth";
import { BannerForm } from "@/components/admin/BannerForm";

export default async function NewBannerPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return <div>Unauthorized</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">เพิ่มแบนเนอร์ใหม่</h1>
            <BannerForm />
        </div>
    );
}
