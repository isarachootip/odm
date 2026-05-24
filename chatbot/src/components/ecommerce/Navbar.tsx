"use client";

import React, { useState, useEffect } from "react";
import {
    Search, ShoppingCart, User, Menu, Zap,
    Gift, Phone, Globe, ChevronDown, Bell,
    ArrowRight, MessageSquare, HelpCircle,
    Smartphone, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MemberCard } from "./MemberCard";
import { CartDrawer } from "./CartDrawer";
import { VlikeLogo } from "./VlikeLogo";

// Hand-drawn circle path string for the logo
const sketchedCirclePath = "M 25, 2 C 12.3, 2 2, 12.3 2, 25 C 2, 37.7 12.3, 48 25, 48 C 37.7, 48 48, 37.7 48, 25 C 48, 12.3 37.7, 2 25, 2 M 25, 5 C 36, 5 45, 14 45, 25 C 45, 36 36, 45 25, 45 C 14, 45 5, 36 5, 25 C 5, 14 14, 5 25, 5";
// A more "sketched" version with slight irregularities
const roughCircle = "M48.5,25c0,12.7-10.3,23-23,23S2.5,37.7,2.5,25S12.8,2,25.5,2S48.5,12.3,48.5,25z M25.5,5.5c-10.8,0-19.5,8.7-19.5,19.5 s8.7,19.5,19.5,19.5s19.5-8.7,19.5-19.5S36.3,5.5,25.5,5.5z";

export function EcomNavbar() {
    const pathname = usePathname();
    const { totalItems } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Facebook Blue
    const brandColor = "#0866FF";

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-b from-[#0866FF] to-[#004FDE] shadow-md">
                {/* Vlike Topbar (Desktop Only) */}
                <div className="hidden lg:flex max-w-7xl mx-auto px-6 h-8 items-center justify-between text-[11px] text-white/90">
                    <div className="flex items-center gap-4">
                        <Link href="/ecommerce/admin" className="hover:text-white transition-colors">Seller Centre</Link>
                        <div className="w-[1px] h-3 bg-white/20"></div>
                        <Link href="/download" className="hover:text-white transition-colors flex items-center gap-1.5"><Download size={10} /> Download</Link>
                        <div className="w-[1px] h-3 bg-white/20"></div>
                        <span className="flex items-center gap-1.5">Follow us on <FacebookIcon /> <InstagramIcon /></span>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href="/notifications" className="hover:text-white transition-colors flex items-center gap-1.5"><Bell size={12} /> Notifications</Link>
                        <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1.5"><HelpCircle size={12} /> Help</Link>
                        <div className="flex items-center gap-1 hover:text-white cursor-pointer"><Globe size={12} /> EN <ChevronDown size={10} /></div>
                        <div className="flex items-center gap-3">
                            <Link href="/signup" className="font-bold hover:text-white transition-colors">Sign Up</Link>
                            <div className="w-[1px] h-3 bg-white/20"></div>
                            <Link href="/login" className="font-bold hover:text-white transition-colors">Login</Link>
                        </div>
                    </div>
                </div>

                {/* Main Nav */}
                <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4 flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
                    {/* Header Row on Mobile: Logo + Cart + Menu */}
                    <div className="w-full lg:w-auto flex items-center justify-between">
                        <Link href="/ecommerce" className="flex items-center gap-2 lg:gap-3 shrink-0 group">
                            <VlikeLogo className="w-8 h-8 lg:w-12 lg:h-12 shadow-inner group-hover:scale-110 transition-transform" />
                            <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white">Vlike</span>
                        </Link>

                        {/* Mobile Right Controls */}
                        <div className="flex items-center gap-4 lg:hidden">
                            <div className="relative group cursor-pointer" onClick={() => setIsCartOpen(true)}>
                                <div className="relative">
                                    <ShoppingCart size={24} strokeWidth={2} className="text-white" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-white text-[#0866FF] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#0866FF] shadow-md">
                                            {totalItems}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shopee Mega Search */}
                    <div className="w-full flex-1 relative">
                        <div className="flex bg-white rounded-sm p-1 shadow-sm">
                            <input
                                type="text"
                                placeholder="Search..." // Shortened for mobile
                                className="flex-1 px-3 py-1.5 lg:px-4 lg:py-2 text-sm text-gray-800 outline-none w-full"
                            />
                            <button className="bg-[#0866FF] hover:bg-[#004FDE] text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-sm transition-colors flex items-center justify-center">
                                <Search size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        {/* Search Sub-links */}
                        <div className="flex gap-4 mt-1.5 pl-1 overflow-x-auto no-scrollbar whitespace-nowrap">
                            {["Vlike Fashion", "Tech Mall", "Organic Food", "Vouchers"].map(s => (
                                <span key={s} className="text-[11px] text-white/80 hover:text-white cursor-pointer">{s}</span>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Cart */}
                    <div className="hidden lg:block relative group cursor-pointer pr-4" onClick={() => setIsCartOpen(true)}>
                        <div className="relative">
                            <ShoppingCart size={28} strokeWidth={2} className="text-white" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-white text-[#0866FF] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#0866FF] shadow-md">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}

function FacebookIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="hover:text-white transition-colors cursor-pointer"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
}

function InstagramIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="hover:text-white transition-colors cursor-pointer"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.984.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
}
