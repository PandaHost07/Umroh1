import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi");
        }

        // Cek user berdasarkan email di model Akun
        const user = await prisma.akun.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Validasi password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        // Buat session token manual
        const sessionToken = randomBytes(32).toString("hex");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 hari masa aktif sesi

        // Simpan session di tabel Session
        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.email, 
            expires,
          },
        });

        // Kembalikan data user ke NextAuth
        return {
          id: user.email, // karena email jadi primary key
          name: user.nama,
          email: user.email,
          image: user.gambar,
          role: user.role,
          sessionToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Saat login
      if (user) {
        token.id = user.id;
        token.nama = user.nama;
        token.email = user.email;
        token.gambar = user.gambar;
        token.role = user.role;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },

    async session({ session, token }) {
      // Saat session diakses
      if (token) {
        session.user.id = token.id;
        session.user.nama = token.nama;
        session.user.email = token.email;
        session.user.gambar = token.gambar;
        session.user.role = token.role;
        session.user.sessionToken = token.sessionToken;
      }
      return session;
    },

    async signIn({ user }) {
      if (!user?.email) return false;

      // Pastikan user benar-benar ada di DB
      const existingUser = await prisma.akun.findUnique({
        where: { email: user.email },
      });

      return !!existingUser;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
