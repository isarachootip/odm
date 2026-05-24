import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        // Fallback if middleware misses it or for static generation safety
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Admin Sidebar */}
            <aside className="w-full bg-slate-900 text-white md:w-64 md:min-h-screen flex-shrink-0">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold tracking-tight">Admin Console</h2>
                    <p className="text-xs text-slate-400 mt-1">Odm Vidwa Management</p>
                </div>

                <nav className="flex flex-col p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-800/50">
                            <Package className="mr-2 h-4 w-4" /> Orders
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <ShoppingBag className="mr-2 h-4 w-4" /> Products
                        </Button>
                    </Link>
                    <Link href="/admin/categories">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Package className="mr-2 h-4 w-4" /> Categories
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" /> Users
                        </Button>
                    </Link>
                    <Link href="/admin/bank">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Settings className="mr-2 h-4 w-4" /> Payment Settings
                        </Button>
                    </Link>
                    <Link href="/admin/shop-config">
                        <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                            <Settings className="mr-2 h-4 w-4" /> Shop Config
                        </Button>
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <Link href="/">
                            <Button variant="secondary" className="w-full">
                                &larr; Back to Shop
                            </Button>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Admin Content */}
            <main className="flex-1 bg-yellow-50 p-6 md:p-8">
                {children}
            </main>
        </div >
    );
}
