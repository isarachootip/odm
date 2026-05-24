import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
        newUser: "/register",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/admin");
            // Add more protected routes here later, e.g. /profile, /orders

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // We allow access here to let the Layout handle the specific Role check
                    // This avoids issues where the Middleware (Edge) doesn't see the full Session (with Role)
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === "/login") {
                return Response.redirect(new URL("/", nextUrl));
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
