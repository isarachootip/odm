"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);

    // Customization State
    const [sweetness, setSweetness] = useState("100%");
    const [addons, setAddons] = useState<string[]>([]);

    const SWEETNESS_LEVELS = ["0%", "25%", "50%", "100%"];
    const ADDONS_OPTIONS = [
        { id: "shot", name: "Extra Shot", price: 15 },
        { id: "honey", name: "Honey", price: 15 },
    ];

    const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
    const increaseQty = () => setQuantity((prev) => prev + 1);

    const toggleAddon = (name: string) => {
        setAddons(prev =>
            prev.includes(name)
                ? prev.filter(a => a !== name)
                : [...prev, name]
        );
    };

    // Calculate dynamic price
    const basePrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
    const addonsPrice = addons.reduce((total, addonName) => {
        const option = ADDONS_OPTIONS.find(o => o.name === addonName);
        return total + (option?.price || 0);
    }, 0);
    const finalPricePerItem = basePrice + addonsPrice;

    const handleAddToCart = () => {
        addItem(product, quantity, {
            sweetness,
            addons: addons.length > 0 ? addons : undefined
        }, finalPricePerItem); // Pass calculated price
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {product.name}
                </h1>
                <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                            ฿{finalPricePerItem.toLocaleString()}
                        </span>
                        {addonsPrice > 0 && (
                            <span className="text-sm text-muted-foreground font-medium">
                                ({basePrice} + {addonsPrice})
                            </span>
                        )}
                        {product.salePrice && addonsPrice === 0 && (
                            <span className="text-xl text-muted-foreground line-through">
                                ฿{product.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Description */}
            <div className="text-base text-gray-600 leading-relaxed">
                <p>{product.description || ""}</p>
            </div>

            {/* Customizations Container */}
            <div className="space-y-6 pt-2">

                {/* Sweetness Selector */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">ระดับความหวาน (Sweetness)</h3>
                    <div className="flex flex-wrap gap-2">
                        {SWEETNESS_LEVELS.map((level) => (
                            <button
                                key={level}
                                onClick={() => setSweetness(level)}
                                className={cn(
                                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                    sweetness === level
                                        ? "border-black bg-black text-white shadow-md"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-black/30"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add-ons Selector */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">เพิ่มเติม (Add-ons)</h3>
                    <div className="flex flex-col gap-3">
                        {ADDONS_OPTIONS.map((option) => (
                            <label
                                key={option.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                    addons.includes(option.name) ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                        addons.includes(option.name) ? "bg-green-500 border-green-500 text-white" : "border-gray-300 bg-white"
                                    )}>
                                        {addons.includes(option.name) && <Plus className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{option.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">+฿{option.price}</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={addons.includes(option.name)}
                                    onChange={() => toggleAddon(option.name)}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end pt-6 border-t mt-4">
                {/* Quantity */}
                <div className="space-y-2">
                    <span className="text-sm font-medium">Quantity</span>
                    <div className="flex items-center rounded-md border h-12">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-12 rounded-none"
                            onClick={decreaseQty}
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex h-full w-14 items-center justify-center border-x text-center text-lg font-medium">
                            {quantity}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-12 rounded-none"
                            onClick={increaseQty}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Add to Cart */}
                <Button
                    className="h-12 flex-1 gap-2 text-base bg-black hover:bg-zinc-800 text-white shadow-lg"
                    size="lg"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart - ฿{(finalPricePerItem * quantity).toLocaleString()}
                </Button>

                {/* Wishlist */}
                <Button variant="outline" size="icon" className="h-12 w-12 border-gray-200">
                    <Heart className="h-5 w-5" />
                </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    In Stock (Ready to ship)
                </div>
            </div>
        </div>
    );
}
