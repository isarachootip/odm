"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot } from "lucide-react";
import { useState } from "react";
import { ChatInterface } from "../chat-interface";
import { usePathname } from "next/navigation";

export function FloatingChat() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 z-[200]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" }}
                        className="absolute bottom-24 right-0 w-[90vw] max-w-[440px] h-[650px] max-h-[85vh] glass-card bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col rounded-[2.5rem]"
                    >
                        {/* Elite Drawer Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00B900] to-[#008a00] flex items-center justify-center shadow-lg border border-white/10">
                                    <Bot className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-base tracking-tight uppercase">AI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Nong Jai Dee • Online</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Integrated Chat Interface */}
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface isEmbedded />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,185,0,0.3)] transition-all duration-500 ${isOpen ? "bg-white text-black" : "bg-[#00B900] text-white"
                    }`}
            >
                {isOpen ? <X size={28} strokeWidth={3} /> : <MessageCircle size={28} strokeWidth={2.5} />}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-xl border-4 border-white flex items-center justify-center text-[10px] font-black"
                    >
                        1
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
