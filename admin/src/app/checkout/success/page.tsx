import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
    return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="rounded-full bg-green-100 p-6 mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Order Placed Successfully!</h1>
            <p className="mt-4 text-muted-foreground max-w-md">
                Thank you for your purchase. We have received your order and will begin processing it shortly. You will receive an email confirmation soon.
            </p>

            <div className="mt-8 flex gap-4">
                <Link href="/">
                    <Button size="lg">
                        Continue Shopping
                    </Button>
                </Link>
                <Link href="/products">
                    <Button variant="outline" size="lg">
                        View All Products
                    </Button>
                </Link>
            </div>
        </div>
    );
}
