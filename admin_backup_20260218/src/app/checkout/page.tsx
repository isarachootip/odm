"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Truck, Banknote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { createOrder } from "@/actions/order";

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deliveryType, setDeliveryType] = useState<"PICKUP" | "DELIVERY">("PICKUP");

    // Mock Shipping Cost
    const shippingCost = cartTotal > 1000 ? 0 : 50;
    const total = cartTotal + shippingCost;

    const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const shipping = {
            customerName: formData.get("name") as string,
            customerPhone: formData.get("phone") as string,
            deliveryType: deliveryType,
            deliveryLocation: formData.get("location") as string,
        };

        const cartItemsInput = items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
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
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                                            <input type="radio" name="deliveryType" value="PICKUP" defaultChecked onChange={() => setDeliveryType("PICKUP")} />
                                            <span>รับเอง (Pick up)</span>
                                        </label>
                                        <label className="flex items-center gap-2 border p-3 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                                            <input type="radio" name="deliveryType" value="DELIVERY" onChange={() => setDeliveryType("DELIVERY")} />
                                            <span>จัดส่ง (Delivery)</span>
                                        </label>
                                    </div>
                                </div>

                                {deliveryType === "DELIVERY" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label htmlFor="location" className="text-sm font-medium">ระบุสถานที่จัดส่ง</label>
                                        <input required name="location" placeholder="เช่น ตึก A ห้องประชุม 3" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
                            {items.map((item) => (
                                <li key={`${item.id}-${item.selectedVariant?.color}-${item.selectedVariant?.size}`} className="flex gap-4">
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
                                        <p className="text-xs text-muted-foreground">
                                            {item.selectedVariant?.color && `${item.selectedVariant.color}, `}
                                            {item.selectedVariant?.size && item.selectedVariant.size}
                                        </p>
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

                        <Button
                            type="submit"
                            form="checkout-form"
                            className="w-full mt-6 text-lg h-12"
                            size="lg"
                            disabled={isProcessing}
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
