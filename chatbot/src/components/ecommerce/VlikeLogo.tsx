"use client";

import React from "react";

interface VlikeLogoProps {
    className?: string;
    color?: string;
    textColor?: string;
}

export function VlikeLogo({
    className = "w-12 h-12",
    color = "#0866FF",
    textColor = "white"
}: VlikeLogoProps) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Hand-drawn / Sketched Circle SVG */}
            <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full opacity-90" style={{ color }}>
                {/* Solid background circle (optional, but requested V big, like under circle) */}
                <path
                    d="M25,2.5c12.4,0,22.5,10.1,22.5,22.5S37.4,47.5,25,47.5S2.5,37.4,2.5,25S12.6,2.5,25,2.5"
                    fill="currentColor"
                    className="opacity-100"
                />

                {/* The "Sketched" stroke effect */}
                <path
                    d="M25.5,3.5c-4.2-0.4-8.5,0.2-12.4,1.9C9,7.1,5.8,11.1,4.2,15.7c-1.6,4.6-1.6,9.6-0.1,14.2 c1.5,4.6,4.5,8.7,8.4,11.6c3.9,2.9,8.7,4.6,13.6,5c4.9,0.4,9.8-0.6,14.2-3c4.4-2.4,8-6.1,10.2-10.5c2.2-4.4,3-9.3,2.4-14.2 c-0.6-4.9-2.7-9.5-6.1-13.1c-3.4-3.6-7.9-5.9-12.8-6.5"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="opacity-40"
                />

                {/* Second sketch layer for more "drawn" feel */}
                <path
                    d="M22,2c6.1-0.5,12.3,0.8,17.4,4.2c5.1,3.4,8.8,8.6,10.1,14.6c1.3,6,0.3,12.4-2.8,17.7 c-3.1,5.3-8.2,9.3-14.1,11c-5.9,1.7-12.3,1.1-17.8-1.7s-9.5-7.5-11.2-13.5c-1.7-6-1.1-12.5,1.7-18.1S12.5,4,18.5,2.2"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    className="opacity-30"
                />
            </svg>

            {/* Content: Big V and 'like' underneath */}
            <div className="relative z-10 flex flex-col items-center leading-none mt-1">
                <span className="text-2xl font-black italic -mb-1" style={{ color: textColor }}>V</span>
                <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: textColor }}>like</span>
            </div>
        </div>
    );
}
