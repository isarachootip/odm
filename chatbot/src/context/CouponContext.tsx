"use client";

import React, { createContext, useContext, useState } from 'react';

export interface Coupon {
    code: string;
    discountAmount: number;
    type: 'fixed' | 'percent';
    description: string;
    minSpend: number;
}

interface CouponContextType {
    availableCoupons: Coupon[];
    appliedCoupon: Coupon | null;
    applyCoupon: (code: string) => boolean;
    removeCoupon: () => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export function CouponProvider({ children }: { children: React.ReactNode }) {
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    const availableCoupons: Coupon[] = [
        { code: 'WELCOME100', discountAmount: 100, type: 'fixed', description: '฿100 OFF for new members', minSpend: 500 },
        { code: 'ELITE20', discountAmount: 0.2, type: 'percent', description: '20% OFF Site-wide', minSpend: 2000 },
        { code: 'FREESHIP', discountAmount: 50, type: 'fixed', description: 'Free Shipping discount', minSpend: 0 },
    ];

    const applyCoupon = (code: string) => {
        const coupon = availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (coupon) {
            setAppliedCoupon(coupon);
            return true;
        }
        return false;
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    return (
        <CouponContext.Provider value={{ availableCoupons, appliedCoupon, applyCoupon, removeCoupon }}>
            {children}
        </CouponContext.Provider>
    );
}

export function useCoupons() {
    const context = useContext(CouponContext);
    if (context === undefined) {
        throw new Error('useCoupons must be used within a CouponProvider');
    }
    return context;
}
