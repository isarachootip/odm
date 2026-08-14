import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { MemberProvider } from "@/context/MemberContext";
import { CouponProvider } from "@/context/CouponContext";
import { FloatingChat } from "@/components/ecommerce/FloatingChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ครัวคุณแหม่มซอย8",
  description: "เตี๋ยวเรือ + ข้าวแกง รสเด็ด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CouponProvider>
          <MemberProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </MemberProvider>
        </CouponProvider>
      </body>
    </html>
  );
}
