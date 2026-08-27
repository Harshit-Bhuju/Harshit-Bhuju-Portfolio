import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import GitHubProvider from "next-auth/providers/github";

export const ADMIN_LOGIN_SECRET =
  process.env.ADMIN_LOGIN_SECRET || "loginForHarshitBhuju";

/** Manual entry only: /admin/login?value=<ADMIN_LOGIN_SECRET> */
export const adminLoginPath = "/admin/login";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const allowed = (process.env.GITHUB_USERNAME || "Harshit-Bhuju").toLowerCase();
      // @ts-expect-error login exists on GitHub profile
      const userLogin = (profile?.login || "").toLowerCase();
      return userLogin === allowed;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: adminLoginPath,
    error: adminLoginPath,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Universal authentication check that works seamlessly on both local development
 * and Vercel production HTTPS environments (handling __Secure- cookie prefixes).
 */
export async function isAuthenticated(req?: NextRequest): Promise<boolean> {
  // 1. Try standard getServerSession
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) return true;
  } catch {
    // Continue to token check
  }

  // 2. Try getToken directly from cookies (supports both secure HTTPS and standard cookies on Vercel)
  if (req) {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token) return true;
    } catch {
      // Failed token check
    }
  }

  return false;
}
