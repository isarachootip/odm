"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function HeroCarousel({ banners = [] }: { banners?: any[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const t = useTranslations('Hero');

    // Use dynamic banners if available and active, otherwise fallback to mock
    const activeBanners = banners?.filter(b => b.isActive) || [];
    const hasDynamicBanners = activeBanners.length > 0;
    const slides = hasDynamicBanners ? activeBanners : [{ id: 'mock' }];

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const currentBanner = hasDynamicBanners ? slides[currentSlide] : null;

    return (
        <section className="w-full relative overflow-hidden bg-[#e0dfdf] min-h-[500px] lg:min-h-[600px] flex items-center mt-2 rounded-xl mx-auto container">
            {slides.map((slide, idx) => (
                <div 
                    key={slide.id} 
                    className={`absolute inset-0 z-0 transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Image
                        src={hasDynamicBanners ? slide.imageUrl : "/images/food_theme/hero_banner.jpg"}
                        alt={hasDynamicBanners ? slide.title || "Banner" : "Signature Drinks & Cuisine"}
                        fill
                        className="object-cover object-center"
                        priority={idx === 0}
                    />
                </div>
            ))}
            
            <div className="relative z-10 container mx-auto px-6 lg:px-16 flex flex-col justify-center h-full pointer-events-none">
                <div className="max-w-2xl text-left bg-black/60 p-8 rounded-2xl backdrop-blur-sm border border-white/10 pointer-events-auto transition-all duration-500">
                    <p className="text-xl md:text-2xl font-semibold text-yellow-400 mb-2">
                        {currentBanner?.subtitle || t('subtitle')}
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                        {currentBanner?.title || t('title')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                        {currentBanner?.description || t('description')}
                    </p>
                    {(currentBanner?.buttonText || t('orderNow')) && (
                        <Link
                            href={currentBanner?.buttonLink || "/products"}
                            className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
                        >
                            {currentBanner?.buttonText || t('orderNow')}
                        </Link>
                    )}
                </div>
            </div>

            {/* Slider Dots */}
            {slides.length > 1 && (
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-20">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-4 h-4 rounded-full border-2 border-white transition-colors ${currentSlide === idx ? 'bg-primary border-primary' : 'bg-transparent'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
