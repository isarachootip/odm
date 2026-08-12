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

export function Navbar() {
    const { toggleCart, cartCount } = useCart();
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const t = useTranslations('Navigation');

    return (
        <header className="w-full bg-white flex flex-col relative z-50">
            {/* Top Notification Bar Removed for cleaner look */}

            {/* Main Navbar */}
            <div className="w-full border-b shadow-sm sticky top-0 bg-white z-40">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 xl:px-8">
                    
                    {/* Left: Logo & Categories */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-12 h-12">
                                {/* ถ้าอัปโหลดรูป logo.png ไว้ในโฟลเดอร์ public แล้ว รูปจะแสดงตรงนี้ครับ */}
                                <Image 
                                    src="/logo.png" 
                                    alt="ครัวคุณแหม่มซอย8" 
                                    fill 
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900">
                                ครัวคุณแหม่มซอย8
                            </span>
                        </Link>

                        {/* Shop by Categories Dropdown (Removed) */}
                    </div>

                    {/* Center: Navigation Links (Removed) */}

                    {/* Right: Actions */}
                    <div className="flex items-center gap-5 text-gray-800">
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
