"use client";

import React, { useState } from "react";
import { Product } from "@/data/ecommerce/products";
import { useCart } from "@/context/CartContext";
import {
    ChevronLeft, Plus, ShieldCheck, Truck, Star,
    Share2, Heart, Info, FileText, MessageCircle,
    ShoppingBag, Info as InfoIcon, ChevronRight,
    Minus, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import "@/app/ecommerce.css";

export default function ShopeeProductDetailView({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);

    // Shopee Orange
    const shopeeOrange = "#ee4d2d";

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[13px] text-gray-500 py-6">
                <Link href="/ecommerce" className="hover:text-[#ee4d2d]">Vlike</Link>
                <ChevronRight size={14} />
                <Link href={`/ecommerce/${product.zone}`} className="hover:text-[#ee4d2d] capitalize">{product.zone}</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
            </div>

            <div className="bg-white p-6 shadow-sm rounded-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Image Section */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="aspect-square bg-gray-50 rounded-sm overflow-hidden border border-gray-100">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Thumbnail placeholder */}
                    <div className="grid grid-cols-5 gap-2">
                        {[product.image, product.image, product.image, product.image, product.image].map((img, i) => (
                            <div key={i} className={`aspect-square rounded-sm overflow-hidden border-2 ${i === 0 ? 'border-[#ee4d2d]' : 'border-transparent opacity-60'}`}>
                                <img src={img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-10 mt-4 text-sm text-gray-700">
                        <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-2 hover:opacity-70">
                            <Heart size={20} className={isLiked ? "text-red-500 fill-current" : ""} /> Share ({isLiked ? "1.3k" : "1.2k"})
                        </button>
                        <div className="w-[1px] h-4 bg-gray-200"></div>
                        <button className="flex items-center gap-2 hover:opacity-70">
                            <MessageSquareIcon /> Chat Now
                        </button>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-7 flex flex-col">
                    <h1 className="text-xl font-medium text-gray-900 mb-4 leading-tight">
                        {product.zone === 'mall' && <span className="bg-[#d0011b] text-white text-[10px] px-1.5 py-0.5 font-bold mr-2 rounded-sm align-middle">Mall</span>}
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1 border-r pr-4">
                            <span className="text-[#ee4d2d] underline font-medium">4.9</span>
                            <div className="flex text-[#ee4d2d]">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                        </div>
                        <div className="border-r pr-4 text-sm">
                            <span className="underline font-medium text-gray-900">128</span> <span className="text-gray-500">Ratings</span>
                        </div>
                        <div className="text-sm">
                            <span className="font-medium text-gray-900">1.5k</span> <span className="text-gray-500">Sold</span>
                        </div>
                    </div>

                    {/* Price Box */}
                    <div className="bg-[#fafafa] p-5 mb-8">
                        <div className="flex items-center">
                            <span className="text-xs text-[#0866FF]">฿</span>
                            <span className="text-3xl font-medium text-[#0866FF]">{product.price.toLocaleString()}</span>
                            {product.oldPrice && (
                                <span className="text-sm text-gray-400 line-through ml-2">฿{product.oldPrice.toLocaleString()}</span>
                            )}
                            <span className="ml-3 bg-[#0866FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">20% OFF</span>
                        </div>

                        {/* Flash Sale Mock */}
                        <div className="bg-[#e7f3ff] p-3 rounded-sm flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[#0866FF] font-bold text-sm italic">FLASH SALE</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-6 text-sm mb-10">
                        <div className="flex gap-10">
                            <span className="w-24 text-gray-500 shrink-0">Return</span>
                            <span className="text-gray-700 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#0866FF]" /> 15 Days Return <span className="text-gray-400 text-xs">Change of mind is applicable</span>
                            </span>
                        </div>
                        <div className="flex gap-10">
                            <span className="w-24 text-gray-500 shrink-0">Shipping</span>
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <Truck size={16} className="text-gray-400" /> Free Shipping
                                </span>
                                <span className="text-gray-400 text-[12px] pl-6">Shipping from Overesas to Bangkok</span>
                                <span className="text-gray-400 text-[12px] pl-6">Shipping Fee: ฿0</span>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-10 mb-10">
                        <span className="w-24 text-gray-500 shrink-0">Quantity</span>
                        <div className="flex items-center">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >-</button>
                            <div className="w-12 h-8 border-y border-gray-200 flex items-center justify-center text-sm">{quantity}</div>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >+</button>
                        </div>
                        <span className="text-gray-400 text-xs">999 pieces available</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            onClick={() => addToCart({ ...product, quantity })}
                            className="flex-1 h-12 bg-[#e7f3ff] text-[#0866FF] border border-[#0866FF] font-medium flex items-center justify-center gap-2 hover:bg-[#d0e6ff] transition-colors"
                        >
                            <ShoppingCart size={20} /> Add To Cart
                        </button>
                        <button className="flex-1 h-12 bg-[#0866FF] text-white font-medium hover:bg-[#004FDE] transition-colors shadow-md">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Specifications Section */}
            <div className="mt-6 bg-white p-6 shadow-sm rounded-sm">
                <h2 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-900 mb-6 -mx-6 -mt-6">PRODUCT SPECIFICATIONS</h2>
                <div className="space-y-4 text-sm max-w-2xl">
                    <div className="flex gap-10">
                        <span className="w-32 text-gray-500">Category</span>
                        <span className="text-[#ee4d2d] flex items-center gap-1">Vlike <ChevronRight size={10} /> {product.category}</span>
                    </div>
                    <div className="flex gap-10">
                        <span className="w-32 text-gray-500">Brand</span>
                        <span className="text-gray-900">Vlike Select</span>
                    </div>
                    <div className="flex gap-10">
                        <span className="w-32 text-gray-500">Stock</span>
                        <span className="text-gray-900">999</span>
                    </div>
                    <div className="flex gap-10">
                        <span className="w-32 text-gray-500">Ships From</span>
                        <span className="text-gray-900">Overseas</span>
                    </div>
                </div>

                <h2 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-900 mb-6 -mx-6 mt-10">PRODUCT DESCRIPTION</h2>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                    {"\n\nOur products are carefully selected for quality and reliability. Enjoy our special promotions and fast shipping today."}
                </div>
            </div>
        </div>
    );
}

function MessageSquareIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ee4d2d]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
}
