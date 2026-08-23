import { prisma } from "@/lib/prisma";
import { SlipUploadForm } from "@/components/checkout/SlipUploadForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Receipt, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await prisma.order.findUnique({
        where: { id: id },
        include: { items: { include: { Product: true } } }
    });

    if (!order) {
        return <div className="p-8 text-center">Order not found</div>;
    }

    const isPaid = order.status === "PAID" || order.status === "PROCESSING" || order.status === "COMPLETED";

    // Fetch active PromptPay number from DB, fallback to the correct default "0636395619"
    const paymentConfig = await prisma.paymentConfig.findFirst({
        where: { paymentType: "PROMPTPAY", isDefault: true }
    });
    const PROMPTPAY_ID = paymentConfig?.promptpayNumber || "0636395619";
    const qrUrl = `https://promptpay.io/${PROMPTPAY_ID}/${Number(order.total)}`;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {isPaid ? (
                // --- STATE: PAID (Show Queue) ---
                <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="rounded-full bg-green-100 p-6">
                        <CheckCircle2 className="h-16 w-16 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-green-700">ชำระเงินเรียบร้อย!</h1>
                        <p className="text-muted-foreground">ขอบคุณที่ใช้บริการครับ</p>
                    </div>

                    {/* QUEUE CARD */}
                    <div className="w-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-8 shadow-xl transform transition hover:scale-105">
                        <h2 className="text-xl font-medium opacity-90 mb-2">บัตรคิวของคุณ</h2>
                        <div className="text-6xl font-black tracking-widest bg-white/20 rounded-lg py-4 backdrop-blur-sm">
                            A-{order.queueNumber || order.id.slice(-4)}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm opacity-80">
                            <Clock className="w-4 h-4" />
                            <span>กรุณารรอเรียกคิวสักครู่นะครับ</span>
                        </div>
                    </div>

                    {/* LINE OA Invitation Banner */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3 mt-4">
                        <div className="flex items-center gap-2 font-bold text-green-700">
                            <span className="text-xl">💬</span>
                            <span>รับการแจ้งเตือนคิวผ่าน LINE!</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            เพื่อรับการแจ้งเตือนเมื่ออาหารของคุณเสร็จหรือมีโปรโมชันพิเศษ คุณสามารถเพิ่มเพื่อนไลน์ Official Account ของเรา และลงทะเบียนด้วยเบอร์โทรศัพท์ **{order.customerPhone}** ได้เลยครับ!
                        </p>
                        <div className="flex pt-1">
                            <a href={process.env.NEXT_PUBLIC_LINE_OA_LINK || "https://lin.ee/zHNI1PO"} target="_blank" rel="noreferrer" className="w-full">
                                <Button className="w-full bg-[#06C755] hover:bg-[#05B34C] text-white flex items-center justify-center gap-2 text-sm h-10 font-bold">
                                    <span>🟢 เพิ่มเพื่อนไลน์เพื่อรับการแจ้งเตือน</span>
                                </Button>
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <Link href="/">
                            <Button variant="outline">กลับหน้าหลัก</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                // --- STATE: PENDING (Show QR & Upload) ---
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">ยืนยันคำสั่งซื้อ</h1>
                        <p className="text-muted-foreground">Order ID: #{order.id.slice(-6)}</p>
                    </div>

                    <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                        {/* Summary */}
                        <div className="flex justify-between items-center border-b pb-4">
                            <span className="font-semibold">ยอดชำระทั้งหมด</span>
                            <span className="text-2xl font-bold text-primary">฿{Number(order.total).toLocaleString()}</span>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center space-y-3">
                            <div className="relative w-64 h-64 border-2 border-primary rounded-lg overflow-hidden">
                                <Image
                                    src={qrUrl}
                                    alt="PromptPay QR"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">สแกน QR Code เพื่อชำระเงิน</p>
                        </div>

                        {/* Customer Info Review */}
                        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                            <div className="flex gap-2">
                                <span className="font-medium">ชื่อ:</span>
                                <span>{order.customerName}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-medium">เบอร์:</span>
                                <span>{order.customerPhone}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="font-medium">รูปแบบรับสินค้า:</span>
                                <span>
                                    {order.deliveryType === "TAKEAWAY" ? "Takehome" :
                                        order.deliveryType === "DELIVERY" ? "จัดส่ง (Delivery)" :
                                            "รับเอง (Pick up)"}
                                </span>
                            </div>
                            {order.deliveryLocation && (
                                <div className="flex gap-2">
                                    <span className="font-medium"><MapPin className="inline w-3 h-3" /> ที่อยู่:</span>
                                    <span>{order.deliveryLocation}</span>
                                </div>
                            )}
                        </div>

                        {/* Upload Form */}
                        <SlipUploadForm orderId={order.id} />

                        {/* LINE OA Invitation Banner */}
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3 mt-4">
                            <div className="flex items-center gap-2 font-bold text-green-700">
                                <span className="text-xl">💬</span>
                                <span>รับการแจ้งเตือนคิวผ่าน LINE!</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                เพื่อรับการแจ้งเตือนเมื่อการโอนเงินได้รับการยืนยันและติดตามคิวอาหาร คุณสามารถเพิ่มเพื่อนไลน์ Official Account ของเรา และลงทะเบียนด้วยเบอร์โทรศัพท์ **{order.customerPhone}** ได้เลยครับ!
                            </p>
                            <div className="flex pt-1">
                                <a href={process.env.NEXT_PUBLIC_LINE_OA_LINK || "https://lin.ee/zHNI1PO"} target="_blank" rel="noreferrer" className="w-full">
                                    <Button className="w-full bg-[#06C755] hover:bg-[#05B34C] text-white flex items-center justify-center gap-2 text-sm h-10 font-bold">
                                        <span>🟢 เพิ่มเพื่อนไลน์เพื่อรับการแจ้งเตือน</span>
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
