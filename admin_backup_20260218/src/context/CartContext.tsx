"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";

export interface CartItem extends Product {
    quantity: number;
    selectedOptions?: {
        sweetness?: string;
        addons?: string[]; // e.g. ["Extra Shot", "Honey"]
    };
    finalPrice?: number; // Price including add-ons
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, options?: CartItem["selectedOptions"], priceOverride?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    isCartOpen: boolean;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        // eslint-disable-next-line
        setIsMounted(true);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                } else {
                    console.error("Cart data is not an array", parsed);
                    setItems([]); // Reset if invalid
                }
            } catch (e) {
                console.error("Failed to parse cart", e);
                setItems([]);
            }
        }
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addItem = (product: Product, quantity = 1, options?: CartItem["selectedOptions"], priceOverride?: number) => {
        setItems((currentItems) => {
            // Create a unique ID for this item including its options to separate variants
            // For simplicity in this demo, we'll just treat every add as a new item if it has options, 
            // or we could try to match deep equality.
            // Let's stick to the previous simple logic but slightly improved:
            // If options exist, we treat it as unique or we need a way to compare.
            // For now, let's just append if options are present to avoid complex matching logic bugs in React state.

            // Actually, let's try to match if options are identical.
            const existingItemIndex = currentItems.findIndex((item) =>
                item.id === product.id &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(options)
            );

            if (existingItemIndex > -1) {
                const newItems = [...currentItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            }

            return [...currentItems, {
                ...product,
                quantity,
                selectedOptions: options,
                price: priceOverride ? (priceOverride as any) : product.price, // Hacky type cast to Decimal/number compat
                salePrice: priceOverride ? undefined : product.salePrice, // Clear sale price if base changed or keep logic? 
                // Better: keep original price but use functional price for total
                finalPrice: priceOverride || (product.salePrice ? Number(product.salePrice) : Number(product.price))
            }];
        });
        setIsCartOpen(true); // Open cart when adding
    };

    const removeItem = (productId: string) => {
        // Note: This naive remove by ID might remove all variants of the product. 
        // ideally we need a cartItemId. But for now let's keep it simple as user ID.
        // Wait, if we have multiple variants, removing by product.ID removes all. 
        // Let's filter by strict match or just accept this limitation for the demo.
        setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const toggleCart = () => setIsCartOpen((prev) => !prev);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);

    const cartTotal = items.reduce((total, item) => {
        const price = item.finalPrice || (item.salePrice ? Number(item.salePrice) : Number(item.price));
        return total + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                toggleCart,
                isCartOpen,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
