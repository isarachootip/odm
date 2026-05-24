"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { UserNav } from "../auth/UserNav";


export function Navbar() {
    const { toggleCart, cartCount } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4">
                {/* Logo */}
                <div className="mr-4 flex">
                    <Link href="/products" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold inline-block text-xl tracking-tight text-primary">
                            Odm Vidwa
                        </span>
                    </Link>
                    {/* Desktop Navigation - Storefront */}
                    <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                        <Link
                            href="/products"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            สินค้าทั้งหมด
                        </Link>
                        <Link
                            href="/tracker"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            ติดตามสถานะ
                        </Link>
                    </nav>
                </div>

                {/* Right side actions */}
                <div className="flex flex-1 items-center justify-end gap-4">


                    {/* Admin Link */}
                    <Link href="/admin" className="hidden md:flex">
                        <Button variant="ghost" className="text-sm">
                            Admin
                        </Button>
                    </Link>

                    {/* Cart */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        onClick={toggleCart}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                                {cartCount}
                            </span>
                        )}
                        <span className="sr-only">Shopping cart</span>
                    </Button>

                    {/* User Menu */}
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
