"use client";

import Link from "next/link";
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
            {/* Top Notification Bar */}
            {isTopBarVisible && (
                <div className="w-full bg-[#0a3182] text-white text-xs py-2 px-4 flex justify-between items-center relative z-50">
                    <div className="flex-1 text-center font-medium">
                        Top products. Better prices -under $100. <Link href="/shop" className="underline font-bold hover:text-blue-200 ml-1">Shop Now</Link>
                    </div>
                    <button onClick={() => setIsTopBarVisible(false)} className="text-white hover:text-gray-300 absolute right-4">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Navbar */}
            <div className="w-full border-b shadow-sm sticky top-0 bg-white z-40">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 xl:px-8">
                    
                    {/* Left: Logo & Categories */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="text-blue-600">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                            </div>
                            <span className="font-extrabold text-2xl tracking-tight text-gray-900 uppercase">
                                UNIMART
                            </span>
                        </Link>

                        {/* Shop by Categories Dropdown */}
                        <div className="hidden lg:flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                            <Menu className="w-5 h-5" />
                            <span>{t('shopByCategory')}</span>
                        </div>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className="hidden xl:flex items-center gap-8 text-sm font-bold text-gray-800">
                        <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('demos')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href="/products" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('shop')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('pages')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('elements')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('features')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href="#" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            {t('more')} <ChevronDown className="w-4 h-4 text-gray-400" />
                        </Link>
                    </nav>

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
                        
                        {/* Admin Link for convenience (hidden in production typically) */}
                        <Link href="/admin" className="hidden md:block ml-2 text-xs text-gray-400 hover:text-gray-600">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
