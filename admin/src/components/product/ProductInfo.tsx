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

    // Dynamic Options State
    // Store selected values: { [groupId]: "choiceId" } or { [groupId]: ["choiceId1", "choiceId2"] }
    const [selections, setSelections] = useState<Record<string, string | string[]>>({});

    // Parse Options from product.specifications
    const productOptions = (() => {
        if (!product.specifications) return [];
        try {
            const specs = typeof product.specifications === 'string'
                ? JSON.parse(product.specifications)
                : product.specifications;
            return (specs as any).options || [];
        } catch (e) {
            console.error("Failed to parse specifications", e);
            return [];
        }
    })();

    // Initialize default selections (e.g. first option for required selects)
    // using useEffect to avoid infinite loops during render if we were to set state directly
    // simplified: just handle it in the render logic or init state if empty

    const handleSelectionChange = (groupId: string, value: string, type: "select" | "multiselect") => {
        setSelections(prev => {
            if (type === "select") {
                return { ...prev, [groupId]: value };
            } else {
                const current = (prev[groupId] as string[]) || [];
                if (current.includes(value)) {
                    return { ...prev, [groupId]: current.filter(v => v !== value) };
                } else {
                    return { ...prev, [groupId]: [...current, value] };
                }
            }
        });
    };

    const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
    const increaseQty = () => setQuantity((prev) => prev + 1);

    // Calculate dynamic price
    const basePrice = product.salePrice ? Number(product.salePrice) : Number(product.price);

    // Calculate extra price from selections
    const optionsPrice = productOptions.reduce((total: number, group: any) => {
        const selection = selections[group.id];
        if (!selection) return total;

        if (group.type === "select") {
            const choice = group.choices.find((c: any) => c.value === selection);
            return total + (choice?.price || 0);
        } else if (group.type === "multiselect" && Array.isArray(selection)) {
            const choiceTotal = selection.reduce((subTotal, val) => {
                const choice = group.choices.find((c: any) => c.value === val);
                return subTotal + (choice?.price || 0);
            }, 0);
            return total + choiceTotal;
        }
        return total;
    }, 0);

    const finalPricePerItem = basePrice + optionsPrice;

    // Validate required fields
    const isReadyToAddToCart = productOptions.every((group: any) => {
        if (!group.required) return true;
        const selection = selections[group.id];
        if (group.type === "select") return !!selection;
        if (group.type === "multiselect") return Array.isArray(selection) && selection.length > 0;
        return false;
    });

    const handleAddToCart = () => {
        if (!isReadyToAddToCart) {
            alert("Please select all required options.");
            return;
        }

        // Generate options logical string/object
        const selectedOptionsSummary: any = {};
        productOptions.forEach((group: any) => {
            const selection = selections[group.id];
            if (selection) {
                if (group.type === "select") {
                    const choice = group.choices.find((c: any) => c.value === selection);
                    selectedOptionsSummary[group.label] = choice?.label;
                } else if (Array.isArray(selection)) {
                    const choices = selection.map(val => {
                        const c = group.choices.find((choice: any) => choice.value === val);
                        return c?.label;
                    }).filter(Boolean);
                    if (choices.length > 0) {
                        selectedOptionsSummary[group.label] = choices;
                    }
                }
            }
        });

        addItem(product, quantity, selectedOptionsSummary, finalPricePerItem);
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
                        {optionsPrice > 0 && (
                            <span className="text-sm text-muted-foreground font-medium">
                                ({basePrice} + {optionsPrice})
                            </span>
                        )}
                        {product.salePrice && optionsPrice === 0 && (
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

            {/* Dynamic Options Container */}
            <div className="space-y-6 pt-2">
                {productOptions.map((group: any) => (
                    <div key={group.id}>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                            {group.label} {group.required && <span className="text-red-500">*</span>}
                        </h3>

                        {group.type === "select" ? (
                            <div className="flex flex-wrap gap-2">
                                {group.choices.map((choice: any) => (
                                    <button
                                        key={choice.value}
                                        onClick={() => handleSelectionChange(group.id, choice.value, "select")}
                                        className={cn(
                                            "px-4 py-2 rounded-lg border text-sm font-medium transition-all relative overflow-hidden",
                                            selections[group.id] === choice.value
                                                ? "border-black bg-black text-white shadow-md"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-black/30"
                                        )}
                                    >
                                        {choice.label}
                                        {choice.price > 0 && <span className="text-xs ml-1 opacity-80">(+{choice.price})</span>}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {group.choices.map((choice: any) => {
                                    const isSelected = (selections[group.id] as string[])?.includes(choice.value);
                                    return (
                                        <label
                                            key={choice.value}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                    isSelected ? "bg-green-500 border-green-500 text-white" : "border-gray-300 bg-white"
                                                )}>
                                                    {isSelected && <Plus className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{choice.label}</span>
                                            </div>
                                            {choice.price > 0 && <span className="text-sm font-semibold text-gray-900">+฿{choice.price}</span>}
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={!!isSelected}
                                                onChange={() => handleSelectionChange(group.id, choice.value, "multiselect")}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
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
                    className="h-12 flex-1 gap-2 text-base bg-black hover:bg-zinc-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!isReadyToAddToCart}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {isReadyToAddToCart ? `Add to Cart - ฿${(finalPricePerItem * quantity).toLocaleString()}` : 'Select Options'}
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
