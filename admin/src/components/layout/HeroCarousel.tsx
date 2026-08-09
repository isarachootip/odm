"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Mock slides array if we want to expand it later
    const slides = [
        { id: 1 },
        { id: 2 },
    ];

    return (
        <section className="w-full relative overflow-hidden bg-[#e0dfdf] min-h-[500px] lg:min-h-[600px] flex items-center mt-2 rounded-xl mx-auto container">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/unimart/unimart_hero_banner_1786267362608.jpg"
                    alt="Exclusive Offer"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
            
            <div className="relative z-10 container mx-auto px-6 lg:px-16 flex flex-col justify-center h-full">
                <div className="max-w-2xl text-left bg-white/60 p-8 rounded-2xl backdrop-blur-sm">
                    <p className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                        Exclusive Offer Going
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                        Experience Pure Elegance
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
                        A Sensual Blend of Jasmine & White Musk.
                    </p>
                    <Link
                        href="/products"
                        className="inline-block bg-[#3461ed] hover:bg-[#254cc9] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
                    >
                        Shop Collection
                    </Link>
                </div>
            </div>

            {/* Slider Dots */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-4 h-4 rounded-full border-2 border-white transition-colors ${currentSlide === idx ? 'bg-blue-600 border-blue-600' : 'bg-transparent'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
