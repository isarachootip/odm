import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OverviewChart } from "@/components/admin/OverviewChart";

import { DepartmentChart } from "@/components/admin/DepartmentChart";

export default async function AdminDashboardPage() {
    // 1. Fetch Summary Stats
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();

    // Revenue from PAID/PROCESSING/COMPLETED orders
    const paidOrders = await prisma.order.findMany({
        where: {
            status: { in: ['PAID', 'PROCESSING', 'COMPLETED'] }
        },
        select: { total: true }
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);

    // 2. Fetch Recent Sales
    const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { User: true }
    });

    // 3. Overview Data: Sales grouped by Category
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: { status: { in: ['PAID', 'PROCESSING', 'COMPLETED'] } }
        },
        include: { Product: { include: { Category: true } } }
    });

    const categorySales: Record<string, number> = {};
    orderItems.forEach(item => {
        const catName = item.Product.Category.name;
        categorySales[catName] = (categorySales[catName] || 0) + Number(item.price) * item.quantity;
    });

    const graphData = Object.entries(categorySales).map(([name, total]) => ({
        name,
        total
    })).sort((a, b) => b.total - a.total);

    // 4. Department Data
    const departmentGroups = await prisma.order.groupBy({
        by: ['customerDepartment'],
        where: {
            status: { in: ['PAID', 'PROCESSING', 'COMPLETED'] },
            customerDepartment: { not: null }
        },
        _count: {
            id: true
        }
    });

    const departmentData = departmentGroups.map((group) => ({
        name: group.customerDepartment || "Other",
        value: group._count.id
    })).sort((a, b) => b.value - a.value);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">จากออเดอร์ที่ชำระเงินแล้ว</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">ออเดอร์ทั้งหมดในระบบ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">สินค้าที่ลิสต์อยู่ในระบบ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">ผู้ใช้งานที่ลงทะเบียน</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales by Category (Bar Chart) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales by Category (ยอดขายแยกตามประเภท)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={graphData} />
                    </CardContent>
                </Card>

                {/* Department Distribution (Pie Chart) - NEW */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Orders by Department (แผนกที่สั่งซื้อ)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentChart data={departmentData} />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sales Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {order.customerName || order.User?.name || "Guest User"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString('th-TH')} - {order.status}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">฿{Number(order.total).toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-muted-foreground italic">
                                    No recent sales.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
