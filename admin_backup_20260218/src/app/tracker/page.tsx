import { OrderTracker } from "@/components/order/OrderTracker";

export const metadata = {
    title: "ติดตามสถานะ - Joy Cafe",
    description: "ตรวจสอบสถานะคำสั่งซื้อของคุณได้ที่นี่",
};

export default function TrackerPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <OrderTracker />
        </div>
    );
}
