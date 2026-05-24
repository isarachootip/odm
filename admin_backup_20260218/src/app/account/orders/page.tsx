import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground text-lg">You haven&apos;t placed any orders yet.</p>
                    <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
                            <div className="bg-muted/30 px-6 py-4 flex flex-col sm:flex-row justify-between gap-4 border-b">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Placed</p>
                                    <p className="font-medium text-sm">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Amount</p>
                                    <p className="font-medium text-sm">฿{Number(order.total).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order No.</p>
                                    <p className="font-medium text-sm line-clamp-1 overflow-ellipsis max-w-[150px]" title={order.id}>{order.id}</p>
                                </div>
                                <div className="sm:ml-auto flex items-center">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : order.status === "PAID"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flow-root">
                                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <li key={item.id} className="flex py-6">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 relative">
                                                    {item.product.images?.[0] && (
                                                        <Image
                                                            src={item.product.images[0]}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover object-center"
                                                        />
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium">
                                                            <h3>
                                                                <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                                                            </h3>
                                                            <p className="ml-4">฿{Number(item.price).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <p className="text-muted-foreground">Qty {item.quantity}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
