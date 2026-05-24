import { auth } from "@/auth";
import { getShopConfig } from "@/actions/shop-config";
import ShopConfigClient from "@/components/admin/ShopConfigClient";

export default async function ShopConfigPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return <div>Unauthorized</div>;
    }

    const config = await getShopConfig();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">ตั้งค่าร้านค้า (Shop Configuration)</h1>
            <ShopConfigClient initialConfig={config} />
        </div>
    );
}
