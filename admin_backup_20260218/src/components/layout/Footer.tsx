import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold">OKProduct</h3>
                        <p className="text-sm text-muted-foreground">
                            แพลตฟอร์ม E-commerce ที่ดีที่สุดสำหรับสินค้าคุณภาพ
                            ประสบการณ์การช้อปปิ้งที่เหนือระดับ
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:underline">About Us</Link></li>
                            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
                            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/help" className="hover:underline">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                            <li><Link href="/shipping" className="hover:underline">Shipping Info</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-medium">Connect</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:underline">Facebook</Link></li>
                            <li><Link href="#" className="hover:underline">Instagram</Link></li>
                            <li><Link href="#" className="hover:underline">Twitter</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} OKProduct Ecommerce. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
