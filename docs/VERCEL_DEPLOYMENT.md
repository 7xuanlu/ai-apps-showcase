# Vercel Deployment Guide

This guide covers deploying the AI Apps Showcase to Vercel with proper environment configuration.

## Quick Start

1. **Fork or clone the repository**
2. **Connect to Vercel** via GitHub integration
3. **Configure environment variables** (see below)
4. **Deploy**

## Environment Variables Setup

### Required Variables

Add these in your Vercel dashboard (Settings → Environment Variables):

```bash
# Application Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-32-character-secret-here

# Database Configuration
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional OAuth Variables

```bash
# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository has the latest changes:

```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository
5. Click "Deploy" (initial deploy will fail - this is expected)

### 3. Configure Environment Variables

In the Vercel dashboard:

1. Go to your project
2. Click "Settings" → "Environment Variables"
3. Add each required variable:

#### NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://your-app-name.vercel.app` (replace with your actual Vercel URL)
- **Environment**: Production

#### NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Generate with `openssl rand -base64 32` or use a 32+ character random string
- **Environment**: Production

#### Database Configuration
- **DATABASE_PROVIDER**: `postgresql`
- **DATABASE_URL**: Your Supabase connection string (see Supabase setup below)

#### Supabase Configuration
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_ANON_KEY**: Your Supabase anonymous key

### 4. Setup Supabase (Database)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for setup to complete
4. Go to Settings → Database
5. Copy the connection string
6. Go to Settings → API
7. Copy the Project URL and anon key

### 5. Configure OAuth Providers (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Vercel URL to authorized origins
6. Add `https://your-app.vercel.app/api/auth/callback/google` to redirect URIs

#### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Homepage URL: `https://your-app.vercel.app`
4. Set Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`

### 6. Redeploy

After configuring environment variables:

1. Go to Deployments tab in Vercel
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Check "Use existing Build Cache"
5. Click "Redeploy"

## Build Process

The application now includes automatic Prisma generation:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

This ensures the Prisma client is generated during the Vercel build process.

## Troubleshooting

### Build Errors

#### "Failed to collect page data"
- **Cause**: Missing environment variables
- **Solution**: Ensure all required environment variables are set in Vercel dashboard

#### "Prisma Client not generated"
- **Cause**: Build cache issues
- **Solution**: Clear build cache and redeploy

#### "Invalid NEXTAUTH_URL"
- **Cause**: Incorrect URL format
- **Solution**: Use your actual Vercel URL: `https://your-app-name.vercel.app`

### Runtime Errors

#### Authentication not working
- **Check**: NEXTAUTH_URL matches your domain
- **Check**: NEXTAUTH_SECRET is set and secure
- **Check**: OAuth callback URLs are correct

#### Database connection errors
- **Check**: DATABASE_URL is correct
- **Check**: Supabase project is active
- **Check**: DATABASE_PROVIDER is set to "postgresql"

### Environment Variable Validation

The app includes comprehensive environment validation:

- **Missing variables**: Clear error messages
- **Invalid formats**: Specific format requirements
- **Security checks**: Warns about weak secrets

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for monitoring:

1. Go to your project dashboard
2. Click "Analytics" tab
3. Enable analytics

### Error Tracking

The application includes built-in error tracking:

- Environment validation errors
- Database connection issues
- Authentication failures

## Security Considerations

### Secrets Management

- Use strong, random secrets (32+ characters)
- Rotate secrets regularly
- Never commit secrets to version control

### Environment Separation

- Use different secrets for different environments
- Separate development and production databases
- Use environment-specific OAuth applications

### HTTPS

- Always use HTTPS in production
- Vercel provides automatic HTTPS
- Update OAuth callback URLs to use HTTPS

## Performance Optimization

### Build Optimization

- Prisma client is generated at build time
- Static pages are pre-rendered where possible
- Edge functions are used for API routes

### Runtime Optimization

- Database connection pooling (handled by Supabase)
- Environment variable caching
- Minimal runtime validation overhead

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Vercel build logs
3. Check environment variable configuration
4. Verify Supabase connection

## Example .env.local for Development

```bash
# Development Configuration
NODE_ENV=development
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key

# Optional OAuth for development
# GOOGLE_CLIENT_ID=your-dev-google-client-id
# GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
# GITHUB_CLIENT_ID=your-dev-github-client-id
# GITHUB_CLIENT_SECRET=your-dev-github-client-secret
```

## Production Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] All required environment variables set
- [ ] Supabase project created and configured
- [ ] OAuth providers configured (if using)
- [ ] NEXTAUTH_URL points to your Vercel domain
- [ ] NEXTAUTH_SECRET is secure (32+ characters)
- [ ] First deployment completed successfully
- [ ] Authentication tested
- [ ] Database connection verified

## Next Steps

After successful deployment:

1. Test all authentication flows
2. Verify database operations
3. Configure custom domain (optional)
4. Set up monitoring and analytics
5. Configure CI/CD for future updates