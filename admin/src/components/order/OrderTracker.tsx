"use client";

import { useState } from "react";
import { Search, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { getPublicOrders } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderTracker() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError("");

        const result = await getPublicOrders(query);

        if (result.error) {
            setError(result.error);
            setOrders([]);
        } else {
            setOrders(result.orders || []);
            if (result.orders?.length === 0) {
                setError("ไม่พบข้อมูลคำสั่งซื้อ กรุณาตรวจสอบเบอร์โทรหรือเลขที่สั่งซื้ออีกครั้ง");
            }
        }
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING": return <Clock className="h-5 w-5 text-yellow-500" />;
            case "PAID": return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "PROCESSING": return <Package className="h-5 w-5 text-blue-500" />;
            case "SHIPPED": return <Truck className="h-5 w-5 text-indigo-500" />;
            case "COMPLETED": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case "CANCELLED": return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PENDING": return "รอชำระเงิน";
            case "PAID": return "ชำระเงินแล้ว";
            case "PROCESSING": return "กำลังจัดเตรียม";
            case "SHIPPED": return "กำลังจัดส่ง";
            case "COMPLETED": return "เสร็จสมบูรณ์";
            case "CANCELLED": return "ยกเลิกแล้ว";
            default: return status;
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">ติดตามสถานะคำสั่งซื้อ</h2>
                <p className="text-muted-foreground">กรอกเบอร์โทรศัพท์ หรือเลขที่คำสั่งซื้อของคุณ</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="กรอกเบอร์โทรศัพท์เท่านั้น"
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? "กำลังค้นหา..." : "ค้นหา"}
                </Button>
            </form>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 text-center text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardHeader className="bg-muted/30 pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Order ID</p>
                                    <p className="font-mono text-xs">{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase">วันที่สั่งซื้อ</p>
                                    <p className="text-xs">
                                        {new Date(order.createdAt).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(order.status)}
                                    <span className="font-bold text-primary">{getStatusText(order.status)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground underline decoration-dotted capitalize">{order.deliveryType}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0">
                                        <div className="flex gap-2">
                                            <span className="text-muted-foreground">{item.quantity}x</span>
                                            <span>{item.Product.name}</span>
                                        </div>
                                        <span className="font-medium">฿{Number(item.price).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 flex justify-between items-center border-t">
                                <span className="font-medium">ยอดรวมทั้งสิ้น</span>
                                <span className="text-lg font-bold text-primary">฿{Number(order.total).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
