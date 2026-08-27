import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const ADMIN_LOGIN_SECRET =
  process.env.ADMIN_LOGIN_SECRET || "loginForHarshitBhuju";

/** Manual entry only: /admin/login?value=<ADMIN_LOGIN_SECRET> */
export const adminLoginPath = "/admin/login";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const allowed = process.env.GITHUB_USERNAME || "Harshit-Bhuju";
      // @ts-expect-error login exists on GitHub profile
      return profile?.login === allowed;
    },
  },
  pages: {
    signIn: adminLoginPath,
    error: adminLoginPath,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
