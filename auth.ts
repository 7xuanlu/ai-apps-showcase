import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getEnvironmentConfig, type EnvironmentConfig } from "@/lib/env-config"

// Load and validate environment configuration
let envConfig: EnvironmentConfig;
try {
  envConfig = getEnvironmentConfig();
} catch (error) {
  // During build time, we might not have all environment variables
  // Create a minimal config for build-time compatibility
  if ((process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE) || process.env.VERCEL) {
    console.warn("⚠️ Build-time environment configuration incomplete, using minimal config");
    envConfig = {
      nodeEnv: 'production',
      databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
      databaseProvider: (process.env.DATABASE_PROVIDER as any) || 'sqlite',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      nextAuthSecret: process.env.NEXTAUTH_SECRET || 'development-secret',
    };
  } else {
    console.error("❌ Failed to load environment configuration for authentication:");
    console.error(error instanceof Error ? error.message : error);
    throw new Error("Authentication configuration failed due to invalid environment setup");
  }
}

// Build providers array dynamically based on available configuration
const providers = [];

// Add OAuth providers if configured
if (envConfig.oauthProviders?.google) {
  providers.push(
    GoogleProvider({
      clientId: envConfig.oauthProviders.google.clientId,
      clientSecret: envConfig.oauthProviders.google.clientSecret,
    })
  );
}

if (envConfig.oauthProviders?.github) {
  providers.push(
    GitHubProvider({
      clientId: envConfig.oauthProviders.github.clientId,
      clientSecret: envConfig.oauthProviders.github.clientSecret,
    })
  );
}

// Always add credentials provider for email/password authentication
providers.push(
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
);

// Log configured providers for debugging
console.log(`🔐 NextAuth configured with ${providers.length} providers for ${envConfig.nodeEnv} environment`);
if (envConfig.oauthProviders?.google) console.log('  ✅ Google OAuth enabled');
if (envConfig.oauthProviders?.github) console.log('  ✅ GitHub OAuth enabled');
console.log('  ✅ Credentials provider enabled');

export default NextAuth({
  secret: envConfig.nextAuthSecret,
  providers,
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
  debug: envConfig.nodeEnv === 'development',
})