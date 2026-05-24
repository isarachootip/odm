"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, CreditCard, ChevronLeft, QrCode, Utensils } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, updateInstructions, totalPrice, clearCart } = useCart();
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // Generate QR Code when totalPrice changes
    useEffect(() => {
        if (totalPrice > 0) {
            const mobileNumber = "0932896292";
            const payload = generatePayload(mobileNumber, { amount: totalPrice });
            QRCode.toDataURL(payload)
                .then((url: string) => setQrCodeUrl(url))
                .catch((err: any) => console.error("QR Gen Error", err));
        }
    }, [totalPrice]);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-center p-8">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Utensils size={48} className="text-gray-400" />
                </div>
                <h1 className="text-2xl font-black mb-2">Cart is empty</h1>
                <p className="text-gray-500 mb-8">Go add some delicious food!</p>
                <Link href="/ecommerce/food" className="px-8 py-3 bg-[#00B900] text-white rounded-2xl font-bold shadow-lg shadow-[#00B900]/20">
                    Go to Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] pb-32 pt-8">
            <div className="max-w-2xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/ecommerce/food" className="p-2 bg-white rounded-full shadow hover:scale-105 transition-transform">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-black">MY ORDER</h1>
                </div>

                <div className="space-y-6">
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.cartItemId} // Use unique cartItemId
                                className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100"
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg truncate pr-2">{item.name}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[#ff6b35] font-black mb-4">฿{item.price.toLocaleString()}</p>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200">
                                                <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-white rounded-lg transition-colors">
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Special Instructions</label>
                                    <textarea
                                        value={item.specialInstructions || ""}
                                        onChange={(e) => updateInstructions(item.cartItemId, e.target.value)}
                                        placeholder="E.g., No spicy, extra sauce..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B900]/20 focus:border-[#00B900] transition-all resize-none"
                                        rows={2}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary & QR Payment */}
                <div className="mt-12 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                        <CreditCard className="text-[#00B900]" /> PAYMENT
                    </h2>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 font-medium">Total Items</span>
                        <span className="font-bold">{cart.reduce((Acc, i) => Acc + i.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-8 pb-8 border-b border-dashed border-gray-200">
                        <span className="text-gray-900 font-black text-lg">Total Amount</span>
                        <span className="text-[#00B900] font-black text-3xl">฿{totalPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-[#003b73] text-white p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3"></div>

                        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 transform group-hover:scale-105 transition-transform duration-500">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="PromptPay QR" className="w-48 h-48 object-contain mix-blend-multiply" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                            )}
                        </div>

                        <div className="text-center relative z-10">
                            <p className="font-bold text-lg mb-1">Scan to Pay</p>
                            <p className="opacity-80 font-mono text-sm tracking-widest">PROMPTPAY</p>
                            <p className="text-xs opacity-60 mt-2">093-289-6292</p>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-4 bg-[#00B900] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#00B900]/30 hover:shadow-[#00B900]/50 hover:-translate-y-1 transition-all">
                        CONFIRM PAYMENT
                    </button>
                </div>
            </div>
        </div>
    );
}

