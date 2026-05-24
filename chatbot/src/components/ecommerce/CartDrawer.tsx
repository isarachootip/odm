"use client";

import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-gray-900" />
                                <h2 className="text-2xl font-black">YOUR CART <span className="text-gray-400 text-sm font-normal">({totalItems})</span></h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag size={48} />
                                    </div>
                                    <p className="text-xl font-bold">Your cart is empty</p>
                                    <p>Start shopping in our zones!</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <motion.div
                                        layout
                                        key={item.cartItemId}
                                        className="flex gap-4 p-4 glass-card border-gray-100"
                                    >
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold">{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.cartItemId)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-1">{item.category}</p>
                                            {item.specialInstructions && (
                                                <p className="text-xs text-blue-500 mb-2 italic">"{item.specialInstructions}"</p>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <span className="font-black text-[#004e92]">฿{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t bg-gray-50/50">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="text-3xl font-black">฿{totalPrice.toLocaleString()}</span>
                                </div>
                                <Link href="/ecommerce/cart" className="w-full py-5 bg-black text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]">
                                    <CreditCard /> CHECKOUT NOW
                                </Link>
                                <p className="text-center text-xs text-gray-400 mt-4">Taxes and shipping calculated at checkout</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
