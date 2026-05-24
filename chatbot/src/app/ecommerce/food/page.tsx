"use client";

import { MOCK_PRODUCTS } from "@/data/ecommerce/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default function FoodMenuPage() {
    const { addToCart } = useCart();
    const foodItems = MOCK_PRODUCTS.filter(p => p.zone === 'food');

    return (
        <div className="min-h-screen bg-[#fafafa] pb-32">
            {/* Header */}
            <div className="bg-[#ff6b35] text-white p-8 pt-20 rounded-b-[3rem] mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter mb-2">FOOD ZONE</h1>
                    <p className="font-medium text-white/80">Made to order, fresh for you.</p>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-6 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
                {foodItems.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-col group hover:scale-[1.02] transition-transform"
                    >
                        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 relative bg-gray-100">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                                ฿{item.price}
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description}</p>

                        <button
                            onClick={() => addToCart(item)}
                            className="mt-auto w-full py-3 bg-[#ff6b35] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e65a26] active:scale-95 transition-all shadow-lg shadow-[#ff6b35]/20"
                        >
                            <Plus size={16} /> ADD
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
