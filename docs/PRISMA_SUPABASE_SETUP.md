# Complete Prisma + Supabase + Vercel Setup Guide

This comprehensive guide walks you through setting up Prisma with Supabase as your production database and deploying to Vercel. This project already includes sophisticated environment validation and configuration management.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and **Yarn** (this project uses Yarn for package management)
- **Git** for version control
- **Supabase account** (sign up at [supabase.com](https://supabase.com))
- **Vercel account** (sign up at [vercel.com](https://vercel.com))
- **Basic understanding** of PostgreSQL and environment variables

## 🏗️ Project Overview

Your project already includes:
- ✅ **Prisma ORM** with SQLite/PostgreSQL dual support
- ✅ **Environment validation middleware** with detailed error reporting
- ✅ **Database migration scripts** and utilities
- ✅ **Connection pooling** and retry logic
- ✅ **Development/Production environment separation**

---

## 🚀 Step 1: Development Environment Setup

### 1.1 Clone and Install Dependencies

```bash
# Clone your repository (if not already done)
git clone <your-repository-url>
cd ai-apps-showcase

# Install dependencies using Yarn
yarn install
```

### 1.2 Create Development Environment File

Create `.env.local` for development (this file is gitignored):

```bash
# Create development environment file
touch .env.local
```

Add the following to `.env.local`:

```env
# Development Configuration
NODE_ENV=development
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-32-chars-long

# Optional: OAuth providers for development
# GOOGLE_CLIENT_ID=your-dev-google-client-id
# GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
# GITHUB_CLIENT_ID=your-dev-github-client-id
# GITHUB_CLIENT_SECRET=your-dev-github-client-secret
```

### 1.3 Initialize Development Database

```bash
# Generate Prisma client
yarn prisma generate

# Initialize database with migrations
yarn db:init:dev

# (Optional) Seed development data
yarn db:seed:dev

# Validate environment setup
yarn env:validate:dev
```

### 1.4 Start Development Server

```bash
# Start the development server
yarn dev
```

Your app should now be running at `http://localhost:3000` with SQLite database.

---

## 🗃️ Step 2: Supabase Project Setup

### 2.1 Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [app.supabase.com](https://app.supabase.com)
   - Click "New Project"

2. **Configure Project**
   - **Name**: Choose a descriptive name (e.g., "ai-apps-showcase-prod")
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users/Vercel region
   - Click "Create new project"

3. **Wait for Setup** (1-2 minutes)

### 2.2 Get Database Connection Details

1. **Navigate to Settings**
   - In your Supabase dashboard, go to "Settings" → "Database"

2. **Copy Connection String**
   - Find "Connection string" section
   - Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Get Connection Pooler URLs**
   - Still in Settings → Database
   - Copy both connection strings:
     - **Transaction mode** (port 6543): For serverless/edge functions
     - **Session mode** (port 5432): For migrations and direct operations

### 2.3 Get API Configuration

1. **Go to Settings → API**
2. **Copy the following:**
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **Anon key**: For client-side operations (public)
   - **Service role key**: For server-side operations (keep secret!)

---

## ⚙️ Step 3: Configure Production Environment

### 3.1 Update Prisma Schema (Already Done)

Your `prisma/schema.prisma` has been updated to include `directUrl` for connection pooling:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Added for Supabase pooling
}
```

### 3.2 Prepare Production Environment Variables

Create a temporary file for production setup (don't commit this):

```bash
# Create temporary production config
touch .env.production.temp
```

Add to `.env.production.temp`:

```env
# Production Configuration
NODE_ENV=production
DATABASE_PROVIDER=postgresql

# Database URLs (replace with your actual Supabase details)
# Transaction mode (port 6543) - for serverless/Vercel functions
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Session mode (port 5432) - for migrations and direct operations
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Authentication
NEXTAUTH_URL=https://your-app-name.vercel.app  # Update with your actual Vercel URL
NEXTAUTH_SECRET=generate-secure-32-plus-character-secret-here

# Supabase Configuration
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SUPABASE-SERVICE-ROLE-KEY]

# Optional: OAuth providers
# GOOGLE_CLIENT_ID=your-prod-google-client-id
# GOOGLE_CLIENT_SECRET=your-prod-google-client-secret
# GITHUB_CLIENT_ID=your-prod-github-client-id
# GITHUB_CLIENT_SECRET=your-prod-github-client-secret
```

### 3.3 Run Database Migration to Supabase

```bash
# Load production environment and run migrations
npx dotenv -e .env.production.temp -- yarn prisma migrate deploy

# Generate Prisma client for production
npx dotenv -e .env.production.temp -- yarn prisma generate

# Validate production environment
npx dotenv -e .env.production.temp -- yarn env:validate:prod

# Optional: Seed production data
npx dotenv -e .env.production.temp -- yarn db:seed:prod
```

### 3.4 Clean Up

```bash
# Remove temporary file (important for security)
rm .env.production.temp
```

---

## 🚀 Step 4: Vercel Deployment Setup

### 4.1 Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Configure Prisma and Supabase for production"
git push origin main
```

### 4.2 Create Vercel Project

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Next.js** (should auto-detect)
   - Root Directory: `.` (default)
   - Build Command: `yarn build` (should auto-detect)
   - Output Directory: `.next` (should auto-detect)

4. **Don't Deploy Yet** - click "Environment Variables" first

### 4.3 Configure Environment Variables in Vercel

In the Vercel project settings, add these environment variables:

#### **Core Application Variables**

| Key | Value | Environment |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `DATABASE_PROVIDER` | `postgresql` | Production |
| `DATABASE_URL` | `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | Production |
| `DIRECT_URL` | `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres` | Production |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production |

#### **Supabase Variables**

| Key | Value | Environment |
|-----|-------|-------------|
| `SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` | Production |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production |

#### **Optional OAuth Variables**

| Key | Value | Environment |
|-----|-------|-------------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID | Production |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret | Production |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth client ID | Production |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth client secret | Production |

### 4.4 Deploy to Vercel

1. **Click "Deploy"** - the first deployment will likely succeed now
2. **Wait for deployment** to complete
3. **Note your Vercel URL** (e.g., `https://ai-apps-showcase-abc123.vercel.app`)

### 4.5 Update NEXTAUTH_URL

1. **Go back to Environment Variables**
2. **Update `NEXTAUTH_URL`** with your actual Vercel URL
3. **Redeploy** the application

---

## 🔧 Step 5: OAuth Configuration (Optional)

If you want to enable Google or GitHub authentication:

### 5.1 Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create a project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized origins: `https://your-app-name.vercel.app`
   - Authorized redirect URIs: `https://your-app-name.vercel.app/api/auth/callback/google`

4. **Add to Vercel Environment Variables**
   - `GOOGLE_CLIENT_ID`: Your client ID
   - `GOOGLE_CLIENT_SECRET`: Your client secret

### 5.2 GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit GitHub → Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"

2. **Configure OAuth App**
   - Application name: Your app name
   - Homepage URL: `https://your-app-name.vercel.app`
   - Authorization callback URL: `https://your-app-name.vercel.app/api/auth/callback/github`

3. **Add to Vercel Environment Variables**
   - `GITHUB_CLIENT_ID`: Your client ID
   - `GITHUB_CLIENT_SECRET`: Your client secret

---

## ✅ Step 6: Verification and Testing

### 6.1 Test Local Development

```bash
# Test local development environment
yarn env:validate:dev
yarn dev
```

### 6.2 Test Database Connection

```bash
# Test database connectivity
yarn db:validate
yarn db:status
```

### 6.3 Test Production Deployment

1. **Visit your Vercel URL**
2. **Check database functionality** (create/read data)
3. **Test authentication** (if OAuth configured)
4. **Check Vercel Function Logs** for any errors

### 6.4 Monitor Database Usage

1. **Supabase Dashboard**
   - Monitor database usage and performance
   - Check for connection pool utilization

2. **Vercel Analytics**
   - Monitor function execution times
   - Check for timeout errors

---

## 🔄 Step 7: Database Management Workflows

### 7.1 Making Schema Changes

```bash
# 1. Update your Prisma schema locally
# 2. Create and apply migration
yarn prisma migrate dev --name your_migration_name

# 3. Test locally
yarn dev

# 4. Deploy to production
git add .
git commit -m "Add: your schema changes"
git push origin main
```

The Vercel deployment will automatically run `yarn prisma generate` and `yarn build`.

### 7.2 Viewing Production Data

```bash
# Connect to production database (read-only)
npx prisma studio --browser none
```

Or use Supabase's built-in Table Editor in the dashboard.

### 7.3 Database Maintenance Commands

```bash
# Check database status
yarn db:status

# Reset database (destructive!)
yarn db:reset:prod

# Create manual migration
yarn db:create-migration

# Seed production data
yarn db:seed:prod
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. **"Can't reach database server"**
```bash
# Check your database URL format and credentials
# Ensure Supabase project is active
# Verify network connectivity
```

#### 2. **"Timed out fetching connection"**
```bash
# Add connection timeout parameters:
DATABASE_URL="...?connect_timeout=30&pool_timeout=30"
```

#### 3. **"prepared statement already exists"**
```bash
# Add pgbouncer parameter (already included in our setup):
DATABASE_URL="...?pgbouncer=true"
```

#### 4. **Vercel Build Failures**
```bash
# Ensure postinstall script is in package.json:
"postinstall": "prisma generate"
```

#### 5. **Environment Validation Errors**
```bash
# Use the built-in validation:
yarn env:validate:prod

# Check the detailed error reports in logs
```

### Getting Help

- **Project Documentation**: See `docs/` folder for detailed guides
- **Environment Validation**: Built-in validation provides detailed error messages
- **Supabase Support**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)

---

## 📚 Next Steps

1. **Set up monitoring** with Supabase's built-in analytics
2. **Configure backups** (Supabase provides automatic backups)
3. **Set up staging environment** using Vercel preview deployments
4. **Implement Row Level Security** in Supabase for data protection
5. **Optimize queries** using Supabase's Query Performance Dashboard

---

## 🔐 Security Best Practices

1. **Never commit sensitive data** to version control
2. **Use environment variables** for all secrets
3. **Regularly rotate passwords** and API keys
4. **Enable Row Level Security** on sensitive tables
5. **Monitor database access** logs regularly
6. **Use HTTPS** in production (Vercel provides this automatically)
7. **Limit database permissions** to what's actually needed

---

**🎉 Congratulations!** You now have a fully configured Prisma + Supabase + Vercel setup with professional environment management and validation. 