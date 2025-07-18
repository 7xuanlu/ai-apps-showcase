# Supabase Setup Guide

This guide will walk you through setting up Supabase as your production database for the environment-separated Next.js application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to your project's environment variables
- Basic understanding of PostgreSQL

## Step 1: Create a New Supabase Project

1. **Sign in to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in with your account or create a new one

2. **Create New Project**
   - Click "New Project" button
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: Choose a descriptive name (e.g., "my-app-production")
     - **Database Password**: Generate a strong password and save it securely
     - **Region**: Choose the region closest to your users
   - Click "Create new project"

3. **Wait for Project Setup**
   - Project creation takes 1-2 minutes
   - You'll see a progress indicator during setup

## Step 2: Configure Database Connection

### Get Database URL and API Keys

1. **Copy Connection String**
   - Find the "Connection string" in the "connect"
   - Copy the connection string (it looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with the database password you created

3. **Get API Keys**
   - Go to "Settings" → "API"
   - Copy the following keys:
     - **Project URL**: `https://[PROJECT-REF].supabase.co`
     - **Anon (public) key**: Used for client-side operations
     - **Service role key**: Used for server-side operations (keep secret!)

### Environment Variable Configuration

Add these variables to your production environment (Vercel):

```bash
# Database Configuration
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

## Step 3: Run Database Migrations

### Option A: Using Prisma CLI (Recommended)

1. **Set Environment Variables Locally**
   ```bash
   # Create a temporary .env file for migration
   echo "DATABASE_PROVIDER=postgresql" > .env.migrate
   echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" >> .env.migrate
   ```

2. **Run Migrations**
   ```bash
   # Load environment and run migrations
   npx dotenv -e .env.migrate -- npx prisma migrate deploy
   ```

3. **Generate Prisma Client**
   ```bash
   npx dotenv -e .env.migrate -- npx prisma generate
   ```

4. **Clean Up**
   ```bash
   rm .env.migrate
   ```

### Option B: Using Supabase SQL Editor

1. **Open SQL Editor**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New query"

2. **Run Migration SQL**
   - Copy the SQL from your Prisma migration files (in `prisma/migrations/`)
   - Paste and execute each migration in chronological order

## Step 4: Verify Database Setup

### Check Tables Creation

1. **Using Supabase Dashboard**
   - Go to "Table Editor" in your Supabase dashboard
   - Verify that all your application tables are created
   - Check that the schema matches your Prisma schema

2. **Using Database Connection Test**
   ```bash
   # Test connection with your production environment variables
   node scripts/test-db-connection.js
   ```

### Seed Initial Data (Optional)

If you have seed data:

```bash
# Set production environment variables and run seed
npx dotenv -e .env.migrate -- npx prisma db seed
```

## Step 5: Configure Row Level Security (RLS)

Supabase uses Row Level Security for data protection:

1. **Enable RLS on Tables**
   - Go to "Authentication" → "Policies" in Supabase dashboard
   - Enable RLS for tables that need user-specific access

2. **Create Security Policies**
   - Define policies based on your application's access patterns
   - Example policy for user-specific data:
     ```sql
     CREATE POLICY "Users can view own data" ON users
       FOR SELECT USING (auth.uid() = id);
     ```

## Step 6: Monitor and Maintain

### Database Monitoring

1. **Check Database Usage**
   - Monitor database size in Supabase dashboard
   - Set up alerts for high usage

2. **Performance Monitoring**
   - Use Supabase's built-in performance insights
   - Monitor slow queries and optimize as needed

### Backup Strategy

1. **Automatic Backups**
   - Supabase provides automatic daily backups
   - Backups are retained based on your plan

2. **Manual Backups**
   ```bash
   # Create manual backup using pg_dump
   pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup.sql
   ```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check if your IP is whitelisted (Supabase allows all by default)
   - Verify the connection string format

2. **Migration Failures**
   - Check PostgreSQL compatibility of your schema
   - Ensure migrations are run in correct order

3. **Authentication Issues**
   - Verify API keys are correctly set
   - Check that service role key is used for server-side operations

### Getting Help

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Community Support**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord Community**: [discord.supabase.com](https://discord.supabase.com)

## Security Best Practices

1. **Credential Management**
   - Never commit database passwords to version control
   - Use environment variables for all sensitive data
   - Rotate passwords regularly

2. **Access Control**
   - Use Row Level Security policies
   - Limit service role key usage to server-side only
   - Regularly audit database access logs

3. **Network Security**
   - Consider IP restrictions for sensitive applications
   - Use SSL connections (enabled by default in Supabase)
   - Monitor connection patterns for anomalies

---

**Next Steps**: After completing Supabase setup, proceed to configure your Vercel deployment using the [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md).