import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { OrderStatusSelector } from "@/components/admin/OrderStatusSelector";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            User: true,
            items: {
                include: { Product: true }
            }
        }
    });

    if (!order) {
        notFound();
    }

    // Parse shipping address if it's a string
    const shippingAddress = (order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : {}) as { name?: string; phone?: string; address?: string; city?: string; zip?: string };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Order Details: {order.id}</h1>
                <div>
                    {/* Status Selector Component */}
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Order Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="divide-y">
                            {order.items.map(item => (
                                <div key={item.id} className="py-4 flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded overflow-hidden bg-muted border">
                                        {item.Product.images?.[0] && (
                                            <Image
                                                src={item.Product.images[0]}
                                                alt={item.Product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.Product.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        {/* Display Options */}
                                        {item.options && (
                                            <div className="mt-1 text-xs text-blue-600 bg-blue-50 p-1 rounded inline-block">
                                                {(() => {
                                                    try {
                                                        const opts = typeof item.options === 'string'
                                                            ? JSON.parse(item.options)
                                                            : item.options;

                                                        const parts = [];
                                                        if (opts.sweetness) parts.push(`หวาน: ${opts.sweetness}`);
                                                        if (opts.addons && Array.isArray(opts.addons) && opts.addons.length > 0) {
                                                            parts.push(`+ ${opts.addons.join(", ")}`);
                                                        }
                                                        return parts.join(" | ");
                                                    } catch (e) { return ""; }
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">฿{(Number(item.price) * item.quantity).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">฿{Number(item.price).toLocaleString()} / unit</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center bg-muted/20 p-4 rounded-md">
                            <span className="font-semibold">Total Amount</span>
                            <span className="text-xl font-bold text-primary">฿{Number(order.total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Customer Info</h2>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Name:</span> {order.customerName || order.User?.name || "Guest"}</p>
                            {order.customerPhone && <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>}
                            <p><span className="font-medium">Email:</span> {order.User?.email || "N/A"}</p>
                            <p><span className="font-medium">User ID:</span> <span className="text-xs text-muted-foreground">{order.userId || order.lineUserId || "Guest"}</span></p>
                        </div>
                    </div>

                    {order.isPreorder && (
                        <div className="rounded-lg border bg-yellow-50 p-6 shadow-sm border-yellow-200">
                            <h2 className="text-lg font-semibold mb-2 text-yellow-800">Pre-order Details</h2>
                            <p className="text-sm text-yellow-900">
                                <span className="font-medium">Requested Time:</span> {order.preorderDateTime ? new Date(order.preorderDateTime).toLocaleString('th-TH') : "N/A"}
                            </p>
                        </div>
                    )}

                    {order.paymentSlipUrl && (
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Payment Slip</h2>
                            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
                                <Image
                                    src={`/uploads/${order.paymentSlipUrl}`}
                                    alt="Payment Slip"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Delivery Info</h2>
                        <div className="space-y-1 text-sm">
                            {order.deliveryType ? (
                                <>
                                    <p><span className="font-medium">Type:</span> {order.deliveryType}</p>
                                    {order.deliveryLocation && <p><span className="font-medium">Location:</span> {order.deliveryLocation}</p>}
                                </>
                            ) : (
                                <>
                                    <p className="font-medium">{shippingAddress.name}</p>
                                    <p>{shippingAddress.phone}</p>
                                    <p>{shippingAddress.address}</p>
                                    <p>{shippingAddress.city} {shippingAddress.zip}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
