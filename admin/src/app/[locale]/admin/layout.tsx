import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, Monitor } from "lucide-react";
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
        <div className="flex min-h-screen flex-col md:flex-row bg-white">
            {/* Admin Sidebar */}
            <aside className="w-full bg-white text-slate-900 md:w-64 md:min-h-screen flex-shrink-0 border-r border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Console</h2>
                    <p className="text-xs text-slate-500 mt-1">Odm Vidwa Management</p>
                </div>

                <nav className="flex flex-col p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Package className="mr-2 h-4 w-4" /> Orders
                        </Button>
                    </Link>
                    <Link href="/admin/queue">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Monitor className="mr-2 h-4 w-4" /> Queue Monitor
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <ShoppingBag className="mr-2 h-4 w-4" /> Products
                        </Button>
                    </Link>
                    <Link href="/admin/categories">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Package className="mr-2 h-4 w-4" /> Categories
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Users className="mr-2 h-4 w-4" /> Users
                        </Button>
                    </Link>
                    <Link href="/admin/banners">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Monitor className="mr-2 h-4 w-4" /> Banners
                        </Button>
                    </Link>
                    <Link href="/admin/customers">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Users className="mr-2 h-4 w-4" /> Customers
                        </Button>
                    </Link>
                    <Link href="/admin/evaluations">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Settings className="mr-2 h-4 w-4" /> Evaluations
                        </Button>
                    </Link>
                    <Link href="/admin/bank">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Settings className="mr-2 h-4 w-4" /> Payment Settings
                        </Button>
                    </Link>
                    <Link href="/admin/shop-config">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Settings className="mr-2 h-4 w-4" /> Shop Config
                        </Button>
                    </Link>
                    <Link href="/admin/branches">
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                            <Settings className="mr-2 h-4 w-4" /> Branches
                        </Button>
                    </Link>
                    <div className="pt-4 mt-4 border-t border-slate-200">
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                &larr; Back to Shop
                            </Button>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Admin Content */}
            <main className="flex-1 bg-white p-6 md:p-8">
                {children}
            </main>
        </div >
    );
}
