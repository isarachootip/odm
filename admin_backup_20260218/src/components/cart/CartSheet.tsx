"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export function CartSheet() {
    const { isCartOpen, toggleCart, items, removeItem, updateQuantity, cartTotal } = useCart();

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col bg-background shadow-xl sm:max-w-md"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-4 py-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" /> Shopping Cart
                            </h2>
                            <Button variant="ghost" size="icon" onClick={toggleCart}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                                    <div className="rounded-full bg-muted p-6">
                                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold">Your cart is empty</p>
                                        <p className="text-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
                                    </div>
                                    <Button variant="outline" onClick={toggleCart}>
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex gap-4">
                                            {/* Image */}
                                            <div className="relative h-20 w-20 flex-none overflow-hidden rounded-md border bg-gray-100">
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="flex justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>
                                                        <p className="text-xs text-muted-foreground">{(item as any).Category?.name}</p>
                                                        {/* Custom Options Display */}
                                                        {item.selectedOptions && (
                                                            <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                                                                {item.selectedOptions.sweetness && (
                                                                    <p>Sweetness: {item.selectedOptions.sweetness}</p>
                                                                )}
                                                                {item.selectedOptions.addons && item.selectedOptions.addons.length > 0 && (
                                                                    <p>+ {item.selectedOptions.addons.join(", ")}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center rounded-md border bg-background">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-muted"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="px-2 text-xs font-medium w-8 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-muted"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm font-bold">
                                                        ฿{((item.finalPrice || Number(item.salePrice) || Number(item.price)) * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t bg-muted/20 px-4 py-6 space-y-4">
                                <div className="flex justify-between text-base font-medium">
                                    <span>Subtotal</span>
                                    <span>฿{cartTotal.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Shipping and taxes calculated at checkout.
                                </p>
                                <div className="grid gap-2">
                                    <Button className="w-full text-lg" size="lg" onClick={toggleCart}>
                                        <Link href="/checkout" className="w-full h-full flex items-center justify-center">Checkout</Link>
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={toggleCart}>
                                        <Link href="/products" className="w-full h-full flex items-center justify-center">Continue Shopping</Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
