import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { lable: "email", type: "text" },
        password: { lable: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword,
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
        return user;
      },
    }),
  ],
  // next-auth config
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email || !account) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true },
      });

      const hasAccountLinked = existingUser?.accounts.some(
        (acc) => acc.provider === account.provider,
      );

      if (existingUser && !hasAccountLinked) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId?.toString() ?? "",
            type: account.type,
            access_token: account.access_token,
            token_type: account.token_type,
            scope: account.scope,
          },
        });
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // prefer existing image

        // Override with latest provider's image if available
        if (profile?.picture) token.picture = profile.picture;
        if (profile?.avatar_url) token.picture = profile.avatar_url;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
