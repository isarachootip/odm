"use client";

import React from "react";
import { useMember } from "@/context/MemberContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Award, Zap, ChevronRight } from "lucide-react";

export function MemberCard() {
    const { member, isLoggedIn, login, logout } = useMember();

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Platinum': return 'from-slate-700 to-slate-900';
            case 'Gold': return 'from-amber-400 to-amber-600';
            case 'Silver': return 'from-slate-300 to-slate-500';
            default: return 'from-orange-400 to-orange-600';
        }
    };

    if (!isLoggedIn) {
        return (
            <button
                onClick={login}
                className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
                <User size={16} /> Login to Elite
            </button>
        );
    }

    return (
        <div className="relative group">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-4 p-2 pr-6 rounded-2xl bg-white border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all`}
            >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTierColor(member!.tier)} flex items-center justify-center text-white shadow-lg`}>
                    <Award size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{member!.tier} Member</span>
                    <span className="text-xs font-black text-gray-900">{member!.name}</span>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
            </motion.div>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[70]">
                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden p-6">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                        <img src={member!.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl bg-gray-50 p-1" />
                        <div>
                            <h4 className="font-black text-gray-900 text-sm">{member!.name}</h4>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase">
                                <Zap size={10} fill="currentColor" /> {member!.points} Points
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group/item">
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">My Account</span>
                            <ChevronRight size={14} className="text-gray-300 group-hover/item:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group/item">
                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Rewards</span>
                            <ChevronRight size={14} className="text-gray-300 group-hover/item:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-4"
                        >
                            <LogOut size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
