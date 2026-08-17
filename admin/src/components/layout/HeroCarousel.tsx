"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDE_DURATION = 8000; // 8 seconds per banner

interface BannerItem {
    id: string | number;
    imageUrl?: string;
    subtitle?: string | null;
    title?: string | null;
    description?: string | null;
    buttonText?: string | null;
    buttonLink?: string | null;
    isActive?: boolean;
}

export function HeroCarousel({ banners = [] }: { banners?: BannerItem[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const t = useTranslations('Hero');

    // Use dynamic banners if available and active, otherwise fallback to mock
    const activeBanners = banners?.filter(b => b.isActive) || [];
    const hasDynamicBanners = activeBanners.length > 0;
    const slides = hasDynamicBanners ? activeBanners : [{ id: 'mock' }];
    const totalSlides = slides.length;

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }, [totalSlides]);

    const goToSlide = (idx: number) => {
        if (idx === currentIndex) return;
        setDirection(idx > currentIndex ? 1 : -1);
        setCurrentIndex(idx);
    };

    // Auto-slide effect (8 seconds timer with loop)
    useEffect(() => {
        if (totalSlides <= 1 || isPaused) return;

        const timer = setInterval(() => {
            nextSlide();
        }, SLIDE_DURATION);

        return () => clearInterval(timer);
    }, [totalSlides, isPaused, nextSlide, currentIndex]);

    // Touch gesture handlers for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        setIsPaused(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diffX = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // minimum pixels for swipe

        if (diffX > minSwipeDistance) {
            // Swiped left -> next
            nextSlide();
        } else if (diffX < -minSwipeDistance) {
            // Swiped right -> prev
            prevSlide();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const currentBanner = hasDynamicBanners ? slides[currentIndex] : null;

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 1.02,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: "spring" as const, stiffness: 260, damping: 30 },
                opacity: { duration: 0.6 },
                scale: { duration: 0.8 },
            },
        },
        exit: (dir: number) => ({
            x: dir < 0 ? "100%" : "-100%",
            opacity: 0,
            scale: 0.98,
            transition: {
                x: { type: "spring" as const, stiffness: 260, damping: 30 },
                opacity: { duration: 0.5 },
            },
        }),
    };

    return (
        <section
            className="group relative w-full overflow-hidden bg-gray-900 min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center mt-2 rounded-2xl mx-auto container select-none shadow-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Animated Banner Images & Backgrounds */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={slides[currentIndex]?.id || currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 z-0 h-full w-full"
                >
                    <Image
                        src={hasDynamicBanners ? slides[currentIndex]?.imageUrl || "/images/food_theme/hero_banner.jpg" : "/images/food_theme/hero_banner.jpg"}
                        alt={hasDynamicBanners ? slides[currentIndex]?.title || "Banner" : "Signature Drinks & Cuisine"}
                        fill
                        className="object-cover object-center"
                        priority={currentIndex === 0}
                    />
                    {/* Dark gradient overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/75 md:via-black/35" />
                </motion.div>
            </AnimatePresence>

            {/* Banner Text / CTA Content */}
            <div className="relative z-10 container mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center h-full pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`content-${slides[currentIndex]?.id || currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-2xl text-left bg-black/50 p-6 sm:p-8 md:p-10 rounded-2xl backdrop-blur-md border border-white/10 pointer-events-auto shadow-2xl transition-all duration-300 hover:bg-black/60 ml-auto"
                    >
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-amber-400 mb-2 tracking-wide flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            {currentBanner?.subtitle || t('subtitle')}
                        </p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                            {currentBanner?.title || t('title')}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-xl line-clamp-3 leading-relaxed">
                            {currentBanner?.description || t('description')}
                        </p>
                        {(currentBanner?.buttonText || t('orderNow')) && (
                            <Link
                                href={currentBanner?.buttonLink || "/products"}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30"
                            >
                                <span>{currentBanner?.buttonText || t('orderNow')}</span>
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows (Prev / Next) */}
            {totalSlides > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        aria-label="Previous Slide"
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        aria-label="Next Slide"
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Slider Dots & Progress Indicators */}
            {totalSlides > 1 && (
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 z-20 bg-black/40 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 shadow-lg">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`relative h-2.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                                currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                            }`}
                        >
                            {/* Animated progress bar for active slide */}
                            {currentIndex === idx && !isPaused && (
                                <motion.div
                                    key={`progress-${currentIndex}`}
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                                    className="absolute inset-0 bg-white/40"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
