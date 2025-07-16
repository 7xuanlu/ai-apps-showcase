import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingEnvVars.length > 0) {
  console.warn('Missing required environment variables:', missingEnvVars)
}

// Generate a fallback secret if none is provided
const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only'

export default NextAuth({
  secret: secret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Credentials authorize called with:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          console.log('User not found:', credentials.email);
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)
        
        console.log('Password validation result:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('Invalid password for user:', credentials.email);
          return null
        }

        console.log('User authenticated successfully:', user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { tokenId: token.id, userId: user?.id });
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback:', { sessionUserId: (session.user as any).id, tokenId: token.id });
      if (token) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
})