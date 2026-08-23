"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Search, User, RefreshCcw, Heart, Menu, ChevronDown, Package2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { UserNav } from "../auth/UserNav";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { Charm } from "next/font/google";

const charmFont = Charm({ 
    weight: ["400", "700"], 
    subsets: ["latin", "thai"] 
});

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
    const { toggleCart, cartCount } = useCart();
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const t = useTranslations('Navigation');

    return (
        <header className="w-full bg-white flex flex-col relative z-50">
            {/* Top Notification Bar Removed for cleaner look */}

            {/* Main Navbar */}
            <div className="w-full border-b shadow-sm sticky top-0 bg-white z-40">
                <div className="container mx-auto flex h-24 items-center justify-between px-4 xl:px-8">
                    
                    {/* Left: Logo & Categories */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-sm border border-gray-100">
                                {/* ถ้าอัปโหลดรูป logo.png ไว้ในโฟลเดอร์ public แล้ว รูปจะแสดงตรงนี้ครับ */}
                                <Image 
                                    src={logoUrl || "/logo.png"} 
                                    alt="ครัวคุณแหม่มซอย8" 
                                    fill 
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <span className={`font-bold text-3xl tracking-tight text-gray-900 ${charmFont.className}`}>
                                ครัวคุณแหม่มซอย8
                            </span>
                        </Link>

                        {/* Shop by Categories Dropdown (Removed) */}
                    </div>

                    {/* Center: Navigation Links (Removed) */}

                    {/* Right: Actions */}
                    <div className="flex items-center gap-5 text-gray-800">
                        <Link 
                            href="https://lin.ee/zHNI1PO" 
                            target="_blank" 
                            className="flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 font-noto"
                        >
                            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.038 1.084l-.171 1.027c-.052.307-.252 1.2.107 1.64.358.442.955.143 1.328-.101.372-.245 5.998-3.521 8.188-6.027 1.503-1.637 2.566-3.834 2.566-6.196zm-16.711 3.51h-1.92v-5.267c0-.281-.228-.508-.507-.508s-.508.227-.508.508v5.775c0 .28.228.508.508.508h2.427c.28 0 .507-.228.507-.508s-.227-.508-.507-.508zm2.937-5.775c-.28 0-.508.227-.508.508v5.775c0 .28.228.508.508.508s.508-.228.508-.508v-5.775c0-.281-.228-.508-.508-.508zm4.331 0c-.22 0-.411.144-.476.353l-1.986 5.435c-.097.265.041.558.307.654.264.095.556-.042.652-.307l.385-1.053h2.235l.384 1.053c.074.204.266.331.469.331.061 0 .123-.011.183-.033.266-.097.404-.389.307-.654l-1.986-5.435c-.066-.209-.257-.353-.478-.353zm-.745 3.992l.745-2.039.745 2.039h-1.49zm5.549-1.391c0-.281-.228-.508-.508-.508h-2.148v-1.583h2.148c.28 0 .508-.227.508-.508s-.228-.508-.508-.508h-2.656c-.28 0-.507.227-.507.508v5.775c0 .28.227.508.507.508h2.656c.28 0 .508-.228.508-.508s-.228-.508-.508-.508h-2.148v-2.083h2.148c.28 0 .508-.228.508-.508z"/>
                            </svg>
                            <span className="hidden sm:inline">เพิ่มเพื่อน</span>
                        </Link>
                        <LanguageSwitcher />
                        <button className="hover:text-blue-600 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        
                        <div className="hover:text-blue-600 transition-colors">
                            <UserNav />
                        </div>

                        <Link href="/compare" className="relative hover:text-blue-600 transition-colors hidden sm:block">
                            <RefreshCcw className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                                6
                            </span>
                        </Link>

                        <Link href="/wishlist" className="relative hover:text-blue-600 transition-colors hidden sm:block">
                            <Heart className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                                7
                            </span>
                        </Link>

                        <button onClick={toggleCart} className="relative hover:text-blue-600 transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                                {cartCount > 0 ? cartCount : 3}
                            </span>
                        </button>
                        
                        {/* Admin Link (Removed) */}
                    </div>
                </div>
            </div>
        </header>
    );
}
