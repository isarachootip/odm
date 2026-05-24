"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/ecommerce/products';

interface CartItem extends Product {
    cartItemId: string; // Unique ID for this specific item in the cart
    quantity: number;
    specialInstructions?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number, instructions?: string) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    updateInstructions: (cartItemId: string, instructions: string) => void;
    totalPrice: number;
    totalItems: number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, quantity: number = 1, instructions: string = "") => {
        setCart(prev => {
            // Check if exact same item exists (same product ID AND same instructions)
            // If so, just increment quantity
            const existingIndex = prev.findIndex(item =>
                item.id === product.id && (item.specialInstructions || "") === instructions
            );

            if (existingIndex > -1) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += quantity;
                return newCart;
            }

            // Otherwise add new item
            return [...prev, {
                ...product,
                cartItemId: crypto.randomUUID(),
                quantity,
                specialInstructions: instructions
            }];
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updateInstructions = (cartItemId: string, instructions: string) => {
        setCart(prev => prev.map(item => {
            if (item.cartItemId === cartItemId) {
                return { ...item, specialInstructions: instructions };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, updateInstructions, totalPrice, totalItems, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
