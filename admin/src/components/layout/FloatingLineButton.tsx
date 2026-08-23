"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function FloatingLineButton() {
    const pathname = usePathname();
    
    // Hide floating button on admin panel
    if (pathname?.includes("/admin")) {
        return null;
    }

    return (
        <Link
            href="https://lin.ee/zHNI1PO"
            target="_blank"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border border-green-400 font-noto"
            title="เพิ่มเพื่อนใน LINE"
        >
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.038 1.084l-.171 1.027c-.052.307-.252 1.2.107 1.64.358.442.955.143 1.328-.101.372-.245 5.998-3.521 8.188-6.027 1.503-1.637 2.566-3.834 2.566-6.196zm-16.711 3.51h-1.92v-5.267c0-.281-.228-.508-.507-.508s-.508.227-.508.508v5.775c0 .28.228.508.508.508h2.427c.28 0 .507-.228.507-.508s-.227-.508-.507-.508zm2.937-5.775c-.28 0-.508.227-.508.508v5.775c0 .28.228.508.508.508s.508-.228.508-.508v-5.775c0-.281-.228-.508-.508-.508zm4.331 0c-.22 0-.411.144-.476.353l-1.986 5.435c-.097.265.041.558.307.654.264.095.556-.042.652-.307l.385-1.053h2.235l.384 1.053c.074.204.266.331.469.331.061 0 .123-.011.183-.033.266-.097.404-.389.307-.654l-1.986-5.435c-.066-.209-.257-.353-.478-.353zm-.745 3.992l.745-2.039.745 2.039h-1.49zm5.549-1.391c0-.281-.228-.508-.508-.508h-2.148v-1.583h2.148c.28 0 .508-.227.508-.508s-.228-.508-.508-.508h-2.656c-.28 0-.507.227-.507.508v5.775c0 .28.227.508.507.508h2.656c.28 0 .508-.228.508-.508s-.228-.508-.508-.508h-2.148v-2.083h2.148c.28 0 .508-.228.508-.508z"/>
            </svg>
            <span className="text-xs font-bold pr-1 select-none hidden sm:inline">
                แอดไลน์สั่งอาหาร
            </span>
        </Link>
    );
}
