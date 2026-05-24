"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Utensils, Package, ArrowRight, Sparkles, ShoppingBag, Globe, ShieldCheck } from "lucide-react";
import "@/app/ecommerce.css";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[#fafafa] overflow-hidden selection:bg-[#00B900]/10 selection:text-[#00B900]">
            {/* Elite Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00B900]/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#3b82f6]/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Premium Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#00B900] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B900]/20">
                        <ShoppingBag className="text-white" size={20} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">
                        ECOMM<span className="text-gray-300">HUB</span>
                    </span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <Link href="/ecommerce/food" className="hover:text-black transition-colors">Food</Link>
                    <Link href="/ecommerce/products" className="hover:text-black transition-colors">Non-Food</Link>
                    <div className="w-[1px] h-4 bg-gray-200"></div>
                    <span className="text-green-500">Service Active</span>
                </div>
            </nav>

            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
                {/* Hero Section */}
                <div className="max-w-3xl mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex items-center gap-3 text-[#00B900] mb-6">
                            <Sparkles size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">The Elite Experience</span>
                        </div>
                        <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-gray-900 mb-8">
                            PREMIUM<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-500 to-gray-900">CURATED</span><br />
                            MARKET.
                        </h1>
                        <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl mb-12">
                            Access a world or premium food and high-end non-food products, curated for those who demand excellence in every detail.
                        </p>
                    </motion.div>
                </div>

                {/* Zone Cards */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Food Zone */}
                    <Link href="/ecommerce/food" className="group h-full">
                        <motion.div
                            whileHover={{ y: -12 }}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b35]/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#ff6b35]/10 text-[#ff6b35] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Utensils size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter mb-4 text-gray-900">FOOD ZONE</h2>
                                <p className="text-gray-500 font-medium leading-relaxed mb-12 max-w-[280px]">
                                    Artisanal breads, organic produce, and premium meats sourced from local masters.
                                </p>
                                <div className="flex items-center gap-2 text-[#ff6b35] font-black text-xs uppercase tracking-widest mt-auto">
                                    ENTER MARKET <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Non-Food Zone */}
                    <Link href="/ecommerce/products" className="group h-full">
                        <motion.div
                            whileHover={{ y: -12 }}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-[#111] p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white/5 flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#004e92]/20 blur-[60px] rounded-full translate-x-1/2 translate-y-1/2"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#004e92]/20 text-[#004e92] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                    <Package size={32} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter mb-4 text-white">NON-FOOD</h2>
                                <p className="text-gray-400 font-medium leading-relaxed mb-12 max-w-[280px]">
                                    Elite electronics, designer home decor, and high-performance lifestyle goods.
                                </p>
                                <div className="flex items-center gap-2 text-[#004e92] font-black text-xs uppercase tracking-widest mt-auto">
                                    EXPLORE HUB <ArrowRight size={16} />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>

                {/* Social Proof / Stats */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { icon: Globe, label: "Global Sourcing", detail: "20+ Countries" },
                        { icon: ShieldCheck, label: "Quality Assured", detail: "100% Certified" },
                        { icon: Sparkles, label: "Exclusive Access", detail: "Members Only" },
                        { icon: ShoppingBag, label: "Fast Delivery", detail: "Under 2 Hours" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <stat.icon className="text-gray-300" size={24} strokeWidth={1.5} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                <p className="text-sm font-bold text-gray-900">{stat.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Premium Footer Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </main>
    );
}
