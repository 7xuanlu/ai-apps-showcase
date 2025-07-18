# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying your environment-separated Next.js application to Vercel with proper GitHub integration and environment variable configuration.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A GitHub repository with your application code
- Completed Supabase setup (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))
- OAuth provider credentials (GitHub, Google, etc.)

## Step 1: Prepare Your Repository

### Ensure Required Files Are Present

Verify these files exist in your repository:

1. **`vercel.json`** - Deployment configuration
2. **`.env.example`** - Template for required environment variables
3. **`package.json`** - Dependencies and build scripts
4. **`prisma/schema.prisma`** - Database schema

### Commit and Push Changes

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Connect GitHub Repository to Vercel

### Import Project to Vercel

1. **Sign in to Vercel Dashboard**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your account

2. **Import Git Repository**
   - Click "New Project" or "Add New..."
   - Select "Import Git Repository"
   - Choose your GitHub account and repository
   - Click "Import"

3. **Configure Project Settings**
   - **Project Name**: Use a descriptive name (e.g., "my-app-production")
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: Leave as default (unless your Next.js app is in a subdirectory)
   - **Build and Output Settings**: Leave as default (configured via vercel.json)

## Step 3: Configure Environment Variables

### Required Environment Variables

Set up the following environment variables in Vercel:

#### Database Configuration
```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### NextAuth Configuration
```bash
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=[GENERATE-RANDOM-SECRET]
```

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

#### OAuth Provider Configuration
```bash
# GitHub OAuth (if using)
GITHUB_ID=[YOUR-GITHUB-CLIENT-ID]
GITHUB_SECRET=[YOUR-GITHUB-CLIENT-SECRET]

# Google OAuth (if using)
GOOGLE_CLIENT_ID=[YOUR-GOOGLE-CLIENT-ID]
GOOGLE_CLIENT_SECRET=[YOUR-GOOGLE-CLIENT-SECRET]
```

### Adding Environment Variables in Vercel

1. **Navigate to Project Settings**
   - In your Vercel project dashboard, click "Settings"
   - Go to "Environment Variables" section

2. **Add Each Variable**
   - Click "Add New" for each environment variable
   - **Name**: Enter the variable name (e.g., `DATABASE_URL`)
   - **Value**: Enter the variable value
   - **Environments**: Select "Production" (and "Preview" if needed)
   - Click "Save"

3. **Verify All Variables Are Set**
   - Ensure all required variables from `.env.example` are configured
   - Double-check sensitive values like database passwords and secrets

## Step 4: Configure OAuth Providers

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in details:
     - **Application name**: Your app name
     - **Homepage URL**: `https://your-app-name.vercel.app`
     - **Authorization callback URL**: `https://your-app-name.vercel.app/api/auth/callback/github`
   - Click "Register application"

2. **Get Client Credentials**
   - Copy the "Client ID"
   - Generate and copy the "Client Secret"
   - Add these to your Vercel environment variables

### Google OAuth Setup

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-app-name.vercel.app/api/auth/callback/google`

2. **Configure Credentials**
   - Copy the Client ID and Client Secret
   - Add these to your Vercel environment variables

## Step 5: Deploy and Test

### Initial Deployment

1. **Trigger Deployment**
   - After configuring environment variables, click "Deploy" in Vercel
   - Or push a new commit to trigger automatic deployment

2. **Monitor Build Process**
   - Watch the build logs in Vercel dashboard
   - Check for any build errors or warnings

3. **Verify Deployment**
   - Once deployed, visit your Vercel URL
   - Test basic functionality and authentication

### Database Migration

Your database migrations should run automatically during the build process. If they don't:

1. **Manual Migration** (if needed)
   ```bash
   # Connect to your production database and run migrations
   npx prisma migrate deploy
   ```

2. **Verify Database Schema**
   - Check your Supabase dashboard
   - Ensure all tables are created correctly

## Step 6: Set Up Automatic Deployments

### GitHub Integration

Vercel automatically sets up GitHub integration:

1. **Automatic Deployments**
   - Pushes to `main` branch trigger production deployments
   - Pull requests create preview deployments

2. **Branch Protection** (Recommended)
   - Set up branch protection rules in GitHub
   - Require pull request reviews before merging

### Deployment Settings

1. **Production Branch**
   - Ensure "main" is set as your production branch
   - Configure in Vercel project settings → Git

2. **Build Settings**
   - Build Command: `yarn build` (configured in vercel.json)
   - Install Command: `yarn install`
   - Output Directory: `.next` (default for Next.js)

## Step 7: Configure Custom Domain (Optional)

### Add Custom Domain

1. **Domain Settings**
   - Go to project settings → Domains
   - Click "Add Domain"
   - Enter your custom domain

2. **DNS Configuration**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP addresses

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation and certificate issuance

## Step 8: Monitor and Maintain

### Performance Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics in project settings
   - Monitor page load times and user interactions

2. **Error Tracking**
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor application errors and performance issues

### Deployment Health Checks

1. **Function Logs**
   - Monitor function execution logs in Vercel dashboard
   - Check for database connection issues or API errors

2. **Build Notifications**
   - Set up Slack or email notifications for deployment status
   - Configure in project settings → Notifications

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs for specific errors
   # Common issues:
   # - Missing environment variables
   # - TypeScript errors
   # - Dependency conflicts
   ```

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Supabase connection limits
   - Ensure database is accessible from Vercel's regions

3. **Authentication Problems**
   - Verify OAuth callback URLs match exactly
   - Check NEXTAUTH_URL is set correctly
   - Ensure NEXTAUTH_SECRET is properly generated

### Environment Variable Issues

1. **Missing Variables**
   - Compare with `.env.example`
   - Check variable names for typos
   - Ensure all required variables are set

2. **Variable Precedence**
   - Production variables override preview variables
   - System environment variables take precedence

### Performance Issues

1. **Cold Starts**
   - Serverless functions may have cold start delays
   - Consider upgrading to Pro plan for better performance

2. **Database Connection Pooling**
   - Monitor database connection usage
   - Implement connection pooling if needed

## Security Best Practices

### Environment Variable Security

1. **Sensitive Data**
   - Never commit secrets to version control
   - Use Vercel's encrypted environment variables
   - Rotate secrets regularly

2. **Access Control**
   - Limit team access to production environment variables
   - Use different secrets for preview and production

### Application Security

1. **HTTPS Enforcement**
   - Vercel enforces HTTPS by default
   - Ensure all external API calls use HTTPS

2. **CORS Configuration**
   - Review CORS headers in vercel.json
   - Restrict origins in production

## Advanced Configuration

### Custom Build Process

If you need custom build steps:

```json
{
  "buildCommand": "yarn build && yarn custom-build-step",
  "installCommand": "yarn install --frozen-lockfile"
}
```

### Function Configuration

Optimize serverless functions:

```json
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Edge Functions

For better performance, consider Edge Functions:

```json
{
  "functions": {
    "app/api/edge/**/*.js": {
      "runtime": "edge"
    }
  }
}
```

## Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community Support**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Discord Community**: [vercel.com/discord](https://vercel.com/discord)

---

**Next Steps**: After successful deployment, monitor your application's performance and set up proper monitoring and alerting systems.