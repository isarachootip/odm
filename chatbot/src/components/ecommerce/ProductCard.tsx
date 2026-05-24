"use client";

import React, { useState } from "react";
import { Plus, ShoppingCart, Check, Eye, Truck } from "lucide-react";
import { Product } from "@/data/ecommerce/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { VlikeLogo } from "./VlikeLogo";
import "@/app/ecommerce.css";

export function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Dynamic Action Label based on Zone
    const getActionLabel = () => {
        if (added) return "ADDED";
        switch (product.zone) {
            case 'services': return "BOOK NOW";
            case 'health': return "CONSULT";
            default: return "ADD TO CART";
        }
    };

    // Dynamic Color based on Zone (matching page.tsx config)
    const getPrimaryColor = () => {
        switch (product.zone) {
            case 'services': return "#475569";
            case 'health': return "#0ea5e9";
            default: return "#0866FF";
        }
    };

    const primaryColor = getPrimaryColor();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
            className="bg-white border border-gray-100 overflow-hidden flex flex-col group h-full relative"
        >
            <Link href={`/ecommerce/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                {!imageError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-200">
                        <ShoppingCart size={40} strokeWidth={1} />
                        <span className="text-[10px] uppercase font-bold">No Image</span>
                    </div>
                )}

                {/* Discount Tag (Mock) */}
                <div className="absolute top-0 right-0 bg-[#ffd211] text-black px-1 py-0.5 text-[10px] font-bold flex flex-col items-center shadow-sm">
                    <span>20%</span>
                    <span className="text-[8px] font-normal leading-none" style={{ color: primaryColor }}>OFF</span>
                </div>

                {/* Vlike Mall Badge */}
                {product.zone === 'mall' && (
                    <div className="absolute top-0 left-0 text-white text-[9px] px-1.5 py-0.5 font-bold z-10 flex items-center gap-1"
                        style={{ backgroundColor: primaryColor }}>
                        <VlikeLogo className="w-3 h-3" /> Mall
                    </div>
                )}
            </Link>

            <div className="p-2.5 flex flex-col flex-1">
                <h3 className="text-xs text-gray-800 line-clamp-2 leading-relaxed h-8 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-3">
                    <span className="text-[9px] px-1 leading-none py-0.5 border"
                        style={{ color: primaryColor, borderColor: primaryColor }}>
                        {product.zone === 'services' ? 'Pro Certified' : 'Free Shipping'}
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="font-medium flex items-center gap-1" style={{ color: primaryColor }}>
                        <span className="text-xs">฿</span>
                        <span className="text-lg">{product.price.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                        Sold 100+
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                            setAdded(true);
                            setTimeout(() => setAdded(false), 2000);
                        }}
                        className={`flex-1 py-1.5 rounded-sm text-[10px] font-bold transition-all border flex items-center justify-center gap-1.5 ${added
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                        style={!added ? { color: primaryColor, borderColor: primaryColor } : {}}
                    >
                        {added ? <Check size={14} /> : <Plus size={14} />}
                        {getActionLabel()}
                    </button>
                    <Link
                        href={`/ecommerce/product/${product.id}`}
                        className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 text-gray-400"
                    >
                        <Eye size={14} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
