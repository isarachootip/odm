"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { login } from "@/actions/login";

export default function LoginPage() {
    const [error, setError] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true);
        setError("");

        // We invoke the server action directly
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        }
        // If success, the server action 'signIn' redirects, so we don't need to do anything.
    };

    // Add loading cursor effect
    useEffect(() => {
        if (isPending) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
        return () => {
            document.body.style.cursor = 'default';
        }
    }, [isPending]);

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        Sign in to account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Or{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form action={handleSubmit} className="mt-8 space-y-6">
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full rounded-t-md border border-input bg-background px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
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
                                className="relative block w-full rounded-b-md border border-input bg-background px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[#00B900] text-[#00B900] hover:bg-[#00B900] hover:text-white transition-colors"
                        onClick={() => signIn("line", { callbackUrl: "/admin" })}
                        disabled={isPending}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349.0.63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349.0.63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.348.282-.631.627-.631h2.386c.346 0 .627.284.627.63 0 .346-.281.63-.627.63H17.61v1.125h1.755zM15.962 10.676c0-.347-.281-.631-.628-.631-.345 0-.629.284-.629.631v2.578c0 .346.284.629.629.629.347 0 .628-.283.628-.629V10.676zM13.208 8.109c0 .348-.283.631-.63.631h-1.635v3.454c0 .346-.282.629-.628.629-.348 0-.63-.283-.63-.629V8.109c0-.348.282-.631.63-.631h2.263c.347 0 .63.283.63.631zM9.548 11.905l-2.001-2.903v2.903c0 .346-.282.629-.628.629-.345 0-.63-.283-.63-.629V8.109c0-.348.285-.631.63-.631l2.002 2.904V8.109c0-.348.283-.631.628-.631.348 0 .63.283.63.631v4.455c0 .346-.282.629-.63.629z" />
                            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.302.079.771.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.928 2.573-3.951 2.573-5.992z" />
                        </svg>
                        Log in with LINE
                    </Button>
                </form>
            </div>
        </div>
    );
}
