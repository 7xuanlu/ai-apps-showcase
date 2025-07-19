# Vercel Environment Variables - Quick Reference

This guide provides a quick reference for setting up environment variables in Vercel for your Prisma + Supabase + Next.js application.

## 🚀 How to Add Environment Variables in Vercel

1. **Go to your Vercel project dashboard**
2. **Click "Settings" tab**
3. **Select "Environment Variables" from the sidebar**
4. **Add each variable using the form:**
   - **Name**: The environment variable name
   - **Value**: The environment variable value
   - **Environments**: Select "Production" (and optionally Preview/Development)
5. **Click "Save"**

## 📋 Required Environment Variables

### Core Application Variables

```bash
# Application Environment
NODE_ENV=production
DATABASE_PROVIDER=postgresql

# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-32-character-secret
```

### Supabase Configuration

```bash
# Supabase API Configuration
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Optional OAuth Variables

```bash
# Google OAuth (if using Google authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (if using GitHub authentication)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 🔧 Environment Variable Values Guide

### Database URLs Explained

#### Transaction Mode (DATABASE_URL)
- **Port**: 6543
- **Use**: Serverless functions, Vercel edge functions
- **Parameters**: `?pgbouncer=true&connection_limit=1`
- **Example**: `postgresql://postgres.abc123:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

#### Session Mode (DIRECT_URL)
- **Port**: 5432
- **Use**: Migrations, schema operations
- **No special parameters needed**
- **Example**: `postgresql://postgres.abc123:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres`

### NEXTAUTH_SECRET Generation

Generate a secure secret:
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online generator (use cautiously)
# Visit: https://generate-secret.vercel.app/32
```

### Finding Supabase Values

1. **SUPABASE_URL**:
   - Supabase Dashboard → Settings → API → Project URL

2. **SUPABASE_ANON_KEY**:
   - Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

3. **SUPABASE_SERVICE_ROLE_KEY**:
   - Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`

4. **Database Connection Strings**:
   - Supabase Dashboard → Settings → Database → Connection string

## ⚡ Quick Setup Checklist

- [ ] **NODE_ENV**: Set to `production`
- [ ] **DATABASE_PROVIDER**: Set to `postgresql`
- [ ] **DATABASE_URL**: Transaction mode with pgbouncer params
- [ ] **DIRECT_URL**: Session mode for migrations
- [ ] **NEXTAUTH_URL**: Your actual Vercel deployment URL
- [ ] **NEXTAUTH_SECRET**: Secure 32+ character string
- [ ] **SUPABASE_URL**: Your Supabase project URL
- [ ] **SUPABASE_ANON_KEY**: Public anon key from Supabase
- [ ] **SUPABASE_SERVICE_ROLE_KEY**: Secret service role key
- [ ] **OAuth Variables**: If using Google/GitHub auth

## 🔄 After Adding Variables

1. **Redeploy your application**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Select "Redeploy"

2. **Verify deployment**:
   - Check build logs for errors
   - Test your application functionality
   - Monitor function logs for database connectivity

## 🚨 Common Mistakes to Avoid

1. **❌ Wrong DATABASE_URL format**:
   - Missing `pgbouncer=true&connection_limit=1` parameters
   - Using session mode (port 5432) instead of transaction mode (port 6543)

2. **❌ Incorrect NEXTAUTH_URL**:
   - Using placeholder URL instead of actual Vercel URL
   - Missing HTTPS protocol

3. **❌ Weak NEXTAUTH_SECRET**:
   - Using development secrets in production
   - Secrets shorter than 32 characters

4. **❌ Missing environment selection**:
   - Not selecting "Production" environment in Vercel
   - Only setting variables for "Preview" environment

5. **❌ Exposing secrets**:
   - Accidentally committing secrets to version control
   - Using service role key on client-side

## 🛠️ Troubleshooting Environment Issues

### Database Connection Errors

```bash
# If you see "Can't reach database server":
# 1. Verify SUPABASE project is active
# 2. Check DATABASE_URL format
# 3. Ensure password is correct in connection string
```

### Build Failures

```bash
# If Vercel build fails:
# 1. Check that all required variables are set
# 2. Verify package.json has "postinstall": "prisma generate"
# 3. Look for typos in environment variable names
```

### Authentication Issues

```bash
# If NextAuth.js doesn't work:
# 1. Verify NEXTAUTH_URL matches your actual domain
# 2. Check NEXTAUTH_SECRET is set and secure
# 3. For OAuth: verify redirect URLs in provider settings
```

## 📞 Getting Help

- **Built-in Validation**: Your project includes environment validation that provides detailed error messages
- **Vercel Docs**: [vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Supabase Docs**: [supabase.com/docs/guides/database/connecting-to-postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)
- **NextAuth.js Docs**: [next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)

---

**💡 Tip**: Use Vercel's environment variable preview feature to test changes before deploying to production! 