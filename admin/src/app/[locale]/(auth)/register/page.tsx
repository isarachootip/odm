"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/register";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);

        const result = await register(formData);

        if (result.error) {
            toast.error(result.error);
            setIsPending(false);
        } else {
            toast.success(result.success || "Account created successfully!");
            setIsPending(false);
            // Auto redirect
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-md border border-input bg-background px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full bg-[#EAB308] hover:bg-[#CA8A04]"
                            disabled={isPending}
                        >
                            {isPending ? "Creating account..." : "Sign up"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
