"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MemberTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface Member {
    id: string;
    name: string;
    tier: MemberTier;
    points: number;
    avatar: string;
}

interface MemberContextType {
    member: Member | null;
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
    addPoints: (amount: number) => void;
    getTierDiscount: () => number;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
    const [member, setMember] = useState<Member | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => {
        // Mock login for demo purposes
        setMember({
            id: 'elite-001',
            name: 'K. Isara Elite',
            tier: 'Gold',
            points: 1250,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elite'
        });
        setIsLoggedIn(true);
    };

    const logout = () => {
        setMember(null);
        setIsLoggedIn(false);
    };

    const addPoints = (amount: number) => {
        if (member) {
            setMember({ ...member, points: member.points + amount });
        }
    };

    const getTierDiscount = () => {
        if (!member) return 0;
        switch (member.tier) {
            case 'Silver': return 0.02;
            case 'Gold': return 0.05;
            case 'Platinum': return 0.10;
            default: return 0;
        }
    };

    return (
        <MemberContext.Provider value={{ member, isLoggedIn, login, logout, addPoints, getTierDiscount }}>
            {children}
        </MemberContext.Provider>
    );
}

export function useMember() {
    const context = useContext(MemberContext);
    if (context === undefined) {
        throw new Error('useMember must be used within a MemberProvider');
    }
    return context;
}
