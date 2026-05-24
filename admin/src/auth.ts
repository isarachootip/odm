import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID || "",
            clientSecret: process.env.LINE_CLIENT_SECRET || "",
        }),
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) return user;

                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Allow email/password login unconditionally
            if (account?.provider === "credentials") {
                return true;
            }

            // For LINE Provider
            if (account?.provider === "line") {
                // If LINE returns an email, check if it matches an existing User record
                // (LINE only returns email if the channel requests and user approves "email" scope)
                if (user.email) {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });

                    if (existingUser) {
                        return true; // Link account and login
                    } else {
                        // User not in our system, do not allow login
                        return "/login?error=AccessDenied";
                    }
                } else {
                    // LINE didn't provide email (permissions issue), cannot verify them.
                    return "/login?error=EmailRequired";
                }
            }

            return false;
        },
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
                // If logged in via credentials
                if ((user as any).role) {
                    token.role = (user as any).role;
                }
                if ((user as any).branchId !== undefined) {
                    token.branchId = (user as any).branchId || null;
                }

                // If logged in via LINE, fetch from DB to make sure we have the latest
                if (account?.provider === "line" && user.email) {
                    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.branchId = dbUser.branchId;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session.user.role = token.role as any; // Cast/Validate as needed
                session.user.branchId = token.branchId as string | null;
            }
            return session;
        },
    },
});
