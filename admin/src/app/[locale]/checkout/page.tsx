"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Truck, Banknote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { createOrder } from "@/actions/order";
import { getAvailableTables } from "@/actions/reservation";
import { DiningTable } from "@prisma/client";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deliveryType, setDeliveryType] = useState<"PICKUP" | "TAKEAWAY" | "DELIVERY" | "DINE_IN">("PICKUP");

    // Pre-order detection
    const preorderItems = items.filter(item => 
        item.category?.includes("จองล่วงหน้า") || 
        item.category?.toLowerCase().includes("preorder") || 
        item.category?.toLowerCase().includes("pre-order") ||
        item.nameTh?.includes("จองล่วงหน้า")
    );
    const hasPreorderItems = preorderItems.length > 0;

    // Find allowed days of the week (intersection)
    const getAllowedDays = () => {
        let allowed = [0, 1, 2, 3, 4, 5, 6];
        preorderItems.forEach(item => {
            const days = item.availableDays && item.availableDays.length > 0
                ? item.availableDays
                : [0, 1, 2, 3, 4, 5, 6];
            allowed = allowed.filter(d => days.includes(d));
        });
        return allowed;
    };
    const allowedDays = getAllowedDays();

    const [preorderDate, setPreorderDate] = useState("");
    const [preorderTime, setPreorderTime] = useState("");

    const isPreorderDateValid = () => {
        if (!hasPreorderItems) return true;
        if (!preorderDate) return false;
        const selectedDay = new Date(preorderDate).getDay();
        return allowedDays.includes(selectedDay);
    };

    const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservationTimeSlot, setReservationTimeSlot] = useState("");
    const [availableTables, setAvailableTables] = useState<DiningTable[]>([]);
    const [isLoadingTables, setIsLoadingTables] = useState(false);
    
    useEffect(() => {
        if (deliveryType === "DINE_IN" && reservationDate && reservationTimeSlot) {
            setIsLoadingTables(true);
            getAvailableTables(reservationDate, reservationTimeSlot).then(res => {
                setIsLoadingTables(false);
                if (res.success && res.availableTables) {
                    setAvailableTables(res.availableTables);
                } else {
                    setAvailableTables([]);
                }
            }).catch(() => {
                setIsLoadingTables(false);
                setAvailableTables([]);
            });
        }
    }, [deliveryType, reservationDate, reservationTimeSlot]);

    // Shipping Cost: Free for Dine-in, Pickup, and Takeaway; Delivery is 50฿ (or free if > 1000฿)
    const shippingCost = deliveryType === "DELIVERY" ? (cartTotal > 1000 ? 0 : 50) : 0;
    const total = cartTotal + shippingCost;

    const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        // Preorder date validation
        if (hasPreorderItems) {
            if (!preorderDate || !preorderTime) {
                setError("กรุณาระบุวันและเวลานัดรับสินค้าสั่งจองล่วงหน้า");
                setIsProcessing(false);
                return;
            }
            const selectedDay = new Date(preorderDate).getDay();
            if (!allowedDays.includes(selectedDay)) {
                const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
                const allowedNames = allowedDays.map(d => thaiDays[d]).join(", ");
                setError(`กรุณาเลือกวันนัดรับให้ตรงกับวันเปิดจำหน่ายสินค้า (สินค้าเปิดขายเฉพาะวัน: ${allowedNames})`);
                setIsProcessing(false);
                return;
            }
        }

        const formData = new FormData(e.currentTarget);
        
        let deliveryLocation = (formData.get("location") as string) || "";
        if (deliveryType === "DELIVERY") {
            const houseNo = (formData.get("houseNumber") as string || "").trim();
            const soi = (formData.get("soi") as string || "").trim();
            const landmark = (formData.get("landmark") as string || "").trim();
            
            const parts = [];
            if (houseNo) parts.push(`บ้านเลขที่/อาคาร: ${houseNo}`);
            if (soi) parts.push(`ซอย/ถนน: ${soi}`);
            if (landmark) parts.push(`จุดสังเกต: ${landmark}`);
            
            deliveryLocation = parts.length > 0 ? parts.join(", ") : deliveryLocation;
        }

        const shipping: any = {
            customerName: formData.get("name") as string,
            customerPhone: formData.get("phone") as string,
            deliveryType: deliveryType,
            deliveryLocation: deliveryLocation,
            isPreorder: hasPreorderItems,
            preorderDateTime: hasPreorderItems ? `${preorderDate}T${preorderTime}:00` : undefined,
        };

        if (deliveryType === "DINE_IN") {
            shipping.reservation = {
                date: formData.get("reservationDate") as string,
                timeSlot: formData.get("reservationTimeSlot") as string,
                tableId: formData.get("tableId") as string
            };
        }

        const cartItemsInput = items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            selectedOptions: (item as any).selectedOptions,
            finalPrice: (item as any).finalPrice
        }));

        const result = await createOrder(cartItemsInput, shipping);

        if (result.error) {
            setError(result.error);
            setIsProcessing(false);
        } else {
            clearCart();
            setIsProcessing(false);
            // Redirect to Success Page with Order ID
            router.push(`/checkout/success/${result.orderId}`);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">Add some items to get started.</p>
                <Link href="/">
                    <Button className="mt-6">
                        Back to Shop
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                </Link>
                <h1 className="mt-4 text-3xl font-bold tracking-tight">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Left Column: Shipping Form */}
                <div className="lg:col-span-7">
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">ข้อมูลลูกค้า & การจัดส่ง</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">ชื่อผู้สั่ง</label>
                                    <input required type="text" name="name" placeholder="ระดม" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium">เบอร์โทรศัพท์</label>
                                    <input required type="tel" name="phone" placeholder="08x-xxx-xxxx" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="text-sm font-medium">วิธีการรับสินค้า</label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1 min-w-[120px]">
                                            <input type="radio" name="deliveryType" value="PICKUP" defaultChecked onChange={() => setDeliveryType("PICKUP")} />
                                            <span>รับเอง (Pick up)</span>
                                        </label>
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1 min-w-[120px]">
                                            <input type="radio" name="deliveryType" value="TAKEAWAY" onChange={() => setDeliveryType("TAKEAWAY")} />
                                            <span>Takehome</span>
                                        </label>
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1 min-w-[120px]">
                                            <input type="radio" name="deliveryType" value="DELIVERY" onChange={() => setDeliveryType("DELIVERY")} />
                                            <span>จัดส่ง (Delivery)</span>
                                        </label>
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1 min-w-[120px] bg-orange-50 border-orange-200">
                                            <input type="radio" name="deliveryType" value="DINE_IN" onChange={() => setDeliveryType("DINE_IN")} />
                                            <span className="font-semibold text-orange-700">ทานที่ร้าน (Dine-in)</span>
                                        </label>
                                    </div>
                                </div>

                                {hasPreorderItems && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-5 border border-orange-200 rounded-xl bg-orange-50/60 my-2">
                                        <h3 className="font-bold text-orange-950 flex items-center gap-2 text-sm sm:text-base">
                                            📅 วันเวลาที่นัดรับสินค้าสั่งจองล่วงหน้า (Pre-order Date/Time)
                                        </h3>
                                        <p className="text-xs text-orange-850">
                                            มีสินค้าสั่งจองล่วงหน้าในตะกร้าของคุณ กรุณาระบุวันนัดรับสินค้าให้ตรงกับวันเปิดขาย
                                        </p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-700">วันที่นัดรับ *</label>
                                                <input 
                                                    required 
                                                    type="date" 
                                                    value={preorderDate} 
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setPreorderDate(e.target.value)} 
                                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-700">เวลานัดรับ *</label>
                                                <input 
                                                    required 
                                                    type="time" 
                                                    value={preorderTime} 
                                                    onChange={(e) => setPreorderTime(e.target.value)} 
                                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm" 
                                                />
                                            </div>
                                        </div>

                                        {preorderDate && (() => {
                                            const selectedDay = new Date(preorderDate).getDay();
                                            const isValid = allowedDays.includes(selectedDay);
                                            if (!isValid) {
                                                const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
                                                const allowedNames = allowedDays.map(d => thaiDays[d]).join(", ");
                                                return (
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-755 text-xs font-medium">
                                                        ⚠️ วันนัดรับไม่ตรงกับวันเปิดขายสินค้าชิ้นนี้ (เปิดขายเฉพาะวัน: {allowedNames})
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}

                                {deliveryType === "DELIVERY" && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 p-4 border border-blue-200 rounded-xl bg-blue-50/50">
                                        <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                                            🚚 ที่อยู่สำหรับการจัดส่ง
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label htmlFor="houseNumber" className="text-xs font-medium text-slate-700">บ้านเลขที่ / อาคาร / หมู่บ้าน *</label>
                                                <input required name="houseNumber" placeholder="เช่น 88/12 อาคาร A" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="soi" className="text-xs font-medium text-slate-700">ซอย / ถนน *</label>
                                                <input required name="soi" placeholder="เช่น ซอย 8, ถ.วิภาวดี" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="landmark" className="text-xs font-medium text-slate-700">จุดสังเกต / รายละเอียดเพิ่มเติม</label>
                                            <input name="landmark" placeholder="เช่น ตรงข้ามเซเว่น, วางไว้หน้าห้องพัก" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" />
                                        </div>
                                    </div>
                                )}
                                
                                {deliveryType === "DINE_IN" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-5 border border-orange-200 rounded-xl bg-orange-50/60">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-orange-900 flex items-center gap-2">
                                                🍽️ จองโต๊ะ (Table Reservation)
                                            </h3>
                                            <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-medium">ทานที่ร้าน</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">วันที่</label>
                                                <input required type="date" name="reservationDate" value={reservationDate} onChange={(e) => setReservationDate(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">เวลา (Time Slot)</label>
                                                <select required name="reservationTimeSlot" value={reservationTimeSlot} onChange={(e) => setReservationTimeSlot(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm">
                                                    <option value="">เลือกเวลา...</option>
                                                    <option value="08:00 - 09:00">08:00 - 09:00</option>
                                                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                                                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                                                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                                                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                                                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                                                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                                                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                                                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                                                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                                                    <option value="18:00 - 19:00">18:00 - 19:00</option>
                                                    <option value="19:00 - 20:00">19:00 - 20:00</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">เลือกโต๊ะที่ว่าง</label>
                                            {isLoadingTables ? (
                                                <div className="p-3 text-sm text-slate-500 bg-white rounded-lg border text-center">
                                                    กำลังตรวจสอบโต๊ะว่าง...
                                                </div>
                                            ) : (
                                                <select required name="tableId" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm" disabled={!reservationDate || !reservationTimeSlot || availableTables.length === 0}>
                                                    <option value="">
                                                        {!reservationTimeSlot ? 'กรุณาเลือกวันที่และเวลาก่อน' : (availableTables.length > 0 ? 'เลือกโต๊ะที่ต้องการ...' : 'ไม่มีโต๊ะว่างในช่วงเวลานี้')}
                                                    </option>
                                                    {availableTables.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} (รองรับ {t.capacity} ท่าน)</option>
                                                    ))}
                                                </select>
                                            )}

                                            {reservationDate && reservationTimeSlot && !isLoadingTables && availableTables.length === 0 && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-in fade-in">
                                                    <p className="font-semibold">⚠️ ขออภัย ไม่มีโต๊ะว่างในช่วงเวลาที่คุณเลือก</p>
                                                    <p className="text-xs text-red-600 mt-1">โต๊ะเต็มสำหรับช่วงเวลานี้ กรุณาเลือกช่วงเวลาอื่น หรือติดต่อร้านค้า โทร 093-289-6292 / LINE Admin</p>
                                                </div>
                                            )}

                                            {(!reservationDate || !reservationTimeSlot || availableTables.length > 0) && (
                                                <p className="text-xs text-slate-500 mt-1">ระบบจะแสดงเฉพาะโต๊ะที่ว่างในช่วงเวลาที่คุณเลือก</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </form>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24 rounded-lg border bg-gray-50/50 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                        {/* Items */}
                        <ul className="mb-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item, index) => (
                                <li key={`${item.id}-${index}`} className="flex gap-4">
                                    <div className="relative h-16 w-16 flex-none overflow-hidden rounded-md border bg-white">
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                            {(item as any).selectedOptions && Object.entries((item as any).selectedOptions || {}).map(([key, value]) => (
                                                <div key={key} className="flex gap-1">
                                                    <span className="font-medium">{key}:</span>
                                                    <span>{Array.isArray(value) ? (value as string[]).join(", ") : value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-1 flex justify-between text-sm">
                                            <span className="text-muted-foreground">Qty {item.quantity}</span>
                                            <span className="font-medium">฿{((item.salePrice || item.price) * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="h-px bg-border mb-6" />

                        {/* Costs */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>฿{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{shippingCost === 0 ? "Free" : `฿${shippingCost.toLocaleString()}`}</span>
                            </div>
                        </div>

                        <div className="h-px bg-border my-4" />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>฿{total.toLocaleString()}</span>
                        </div>

                        {error && (
                             <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold text-center animate-shake">
                                 ⚠️ {error}
                             </div>
                         )}

                         <Button
                             type="submit"
                             form="checkout-form"
                             className="w-full mt-6 text-lg h-12"
                             size="lg"
                             disabled={isProcessing || (hasPreorderItems && !isPreorderDateValid())}
                         >
                             {isProcessing ? "Processing..." : "Place Order"}
                         </Button>

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            Secure checkout powered by Stripe (Mock)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
