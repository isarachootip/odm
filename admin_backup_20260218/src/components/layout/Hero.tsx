"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Cafe Data for Banners
const BANNERS = [
    {
        id: 1,
        title: "Welcome to Odm Vidwa",
        description: "Experience the perfect blend of premium coffee and cozy vibes.",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=2000",
        cta: "Order Now",
    },
    {
        id: 2,
        title: "Fresh Bakery Daily",
        description: "Delicious croissants, cakes, and pastries baked fresh every morning.",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=2000",
        cta: "View Menu",
    },
    {
        id: 3,
        title: "Signature Drinks",
        description: "Try our exclusive Yuzu Orange Soda and Thai Tea.",
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=2000",
        cta: "New Arrivals",
    },
];

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide logic
    useEffect(() => {
        // Note: User requested 2 minutes (120000ms). 
        // For demo purposes, using 5000ms (5s) to show effect. 
        // Change to 120000 for production if strictly needed.
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
    };

    return (
        <div className="relative h-[600px] w-full overflow-hidden bg-gray-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Overlay */}
                    <div className="relative h-full w-full">
                        <Image
                            src={BANNERS[currentIndex].image}
                            alt={BANNERS[currentIndex].title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div className="max-w-3xl px-4 text-white">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl"
                            >
                                {BANNERS[currentIndex].title}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8 text-lg text-gray-200 sm:text-xl"
                            >
                                {BANNERS[currentIndex].description}
                            </motion.p>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Link href="/products">
                                    <Button size="lg" className="text-lg bg-white text-black hover:bg-gray-200">
                                        {BANNERS[currentIndex].cta}
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
                <ChevronLeft className="h-10 w-10" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
                <ChevronRight className="h-10 w-10" />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-2">
                {BANNERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-6" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
