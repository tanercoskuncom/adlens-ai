import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre gerekli");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            workspaces: {
              include: { workspace: true },
            },
          },
        });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        // Account tablosundan password'u çek
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "credentials",
          },
        });

        if (!account?.access_token) {
          throw new Error("Şifre ayarlanmamış");
        }

        const isValid = await compare(
          credentials.password,
          account.access_token
        );

        if (!isValid) {
          throw new Error("Şifre hatalı");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}
