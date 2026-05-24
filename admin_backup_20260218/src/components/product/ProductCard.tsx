"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/types";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const discountPercentage = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="group relative rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-100">
                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                            New
                        </span>
                    )}
                    {product.salePrice && (
                        <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                            -{discountPercentage}%
                        </span>
                    )}
                </div>

                {/* Wishlist Button (Top Right) */}
                <button className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Add to wishlist</span>
                </button>

                {/* Main Image */}
                <Link href={`/product/${product.id}`}>
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            product.images.length > 1 ? "group-hover:opacity-0" : ""
                        )}
                    />
                    {/* Second Image (Hover) */}
                    {product.images.length > 1 && (
                        <Image
                            src={product.images[1]}
                            alt={product.name}
                            fill
                            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                    )}
                </Link>

                {/* Quick Action Overlay (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full px-4 py-4 transition-transform duration-300 group-hover:translate-y-0">
                    <div className="flex gap-2">
                        <Link href={`/product/${product.id}`} className="w-full">
                            <Button
                                className="w-full gap-2 shadow-lg"
                                size="sm"
                            >
                                <Eye className="h-4 w-4" /> View Details
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <div className="mb-2 text-xs text-muted-foreground">{product.category}</div>
                <Link href={`/product/${product.id}`}>
                    <h3 className="line-clamp-1 text-sm font-medium hover:underline cursor-pointer">
                        {product.name}
                    </h3>
                    {product.nameTh && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 font-noto">
                            {product.nameTh}
                        </p>
                    )}
                </Link>

                <div className="mt-2 flex items-center gap-2">
                    {product.salePrice ? (
                        <>
                            <span className="text-lg font-bold text-red-600">
                                ฿{product.salePrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                                ฿{product.price.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-bold">
                            ฿{product.price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
