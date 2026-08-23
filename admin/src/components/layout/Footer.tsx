import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold">ครัวคุณแหม่มซอย8</h3>
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
                            <li>
                                <Link 
                                    href="https://lin.ee/nk9MtP7" 
                                    target="_blank" 
                                    className="hover:underline flex items-center gap-1.5 text-[#06C755] font-bold"
                                >
                                    <svg className="w-4 h-4 fill-current text-[#06C755]" viewBox="0 0 24 24">
                                        <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.038 1.084l-.171 1.027c-.052.307-.252 1.2.107 1.64.358.442.955.143 1.328-.101.372-.245 5.998-3.521 8.188-6.027 1.503-1.637 2.566-3.834 2.566-6.196zm-16.711 3.51h-1.92v-5.267c0-.281-.228-.508-.507-.508s-.508.227-.508.508v5.775c0 .28.228.508.508.508h2.427c.28 0 .507-.228.507-.508s-.227-.508-.507-.508zm2.937-5.775c-.28 0-.508.227-.508.508v5.775c0 .28.228.508.508.508s.508-.228.508-.508v-5.775c0-.281-.228-.508-.508-.508zm4.331 0c-.22 0-.411.144-.476.353l-1.986 5.435c-.097.265.041.558.307.654.264.095.556-.042.652-.307l.385-1.053h2.235l.384 1.053c.074.204.266.331.469.331.061 0 .123-.011.183-.033.266-.097.404-.389.307-.654l-1.986-5.435c-.066-.209-.257-.353-.478-.353zm-.745 3.992l.745-2.039.745 2.039h-1.49zm5.549-1.391c0-.281-.228-.508-.508-.508h-2.148v-1.583h2.148c.28 0 .508-.227.508-.508s-.228-.508-.508-.508h-2.656c-.28 0-.507.227-.507.508v5.775c0 .28.227.508.507.508h2.656c.28 0 .508-.228.508-.508s-.228-.508-.508-.508h-2.148v-2.083h2.148c.28 0 .508-.228.508-.508z"/>
                                    </svg>
                                    LINE Official Account
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="https://www.facebook.com/cvarup/" 
                                    target="_blank" 
                                    className="hover:underline flex items-center gap-1.5 text-[#1877F2] font-bold"
                                >
                                    <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Facebook Page
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} ครัวคุณแหม่มซอย8. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
