# Environment Variable Validation Middleware

This document describes the comprehensive environment variable validation system implemented for the Next.js application.

## Overview

The environment validation middleware provides:

- **Startup Validation**: Validates environment variables when the application starts
- **Runtime Validation**: Validates environment variables during request processing
- **Development vs Production Checks**: Environment-specific validation rules
- **Clear Error Reporting**: Detailed error messages with troubleshooting guidance
- **Automated Testing**: Test suite to verify validation logic

## Components

### 1. Environment Validation Middleware (`lib/env-validation-middleware.ts`)

The main validation middleware that provides:

- **Startup validation** with comprehensive error reporting
- **Runtime middleware** for Next.js request processing
- **Environment-specific validation rules**
- **OAuth provider validation**
- **Database configuration validation**
- **Security checks** for production environments

### 2. Environment Configuration (`lib/env-config.ts`)

Centralized environment variable management:

- **Environment detection** (development/production/test)
- **Database URL generation** based on provider
- **Configuration loading** with validation
- **Type-safe configuration interfaces**

### 3. Startup Validation (`lib/startup-validation.ts`)

Application initialization with environment validation:

- **Auto-initialization** when imported
- **Server-side only execution**
- **Graceful error handling** with process exit

### 4. Validation Scripts

#### Standalone Validation (`scripts/validate-environment.js`)

```bash
npm run env:validate          # Validate current environment
npm run env:validate:dev      # Validate development environment
npm run env:validate:prod     # Validate production environment
```

#### Test Suite (`scripts/test-env-validation.js`)

```bash
npm run env:test              # Run validation test suite
```

## Validation Rules

### Required Variables (All Environments)

- `NODE_ENV` - Application environment
- `DATABASE_PROVIDER` - Database type (sqlite/postgresql)
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - NextAuth.js secret key

### Production-Specific Requirements

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Development vs Production Checks

#### Development Environment

- ✅ SQLite database recommended
- ✅ `http://localhost:3000` for NEXTAUTH_URL
- ⚠️ Warns about production configurations
- ⚠️ Suggests simpler development setup

#### Production Environment

- ❌ Blocks SQLite usage
- ❌ Blocks localhost URLs
- ❌ Requires secure secrets (32+ characters)
- ❌ Requires HTTPS for NEXTAUTH_URL
- ✅ Validates Supabase configuration

### OAuth Provider Validation

- **Complete Configuration**: Both client ID and secret required
- **Incomplete Configuration**: Error if only one is provided
- **Optional**: OAuth providers are optional but must be complete if configured

### Database Configuration Validation

- **Provider Validation**: Must be 'sqlite' or 'postgresql'
- **URL Format Validation**:
  - SQLite: Must start with `file:`
  - PostgreSQL: Must start with `postgres`
- **Environment Consistency**: Provider must match URL format

## Error Handling

### Startup Errors

When validation fails at startup:

1. **Development**:

   - Critical errors stop the application
   - Non-critical errors show warnings but continue
   - Detailed error messages with stack traces

2. **Production**:
   - Any validation error stops the application
   - Secure error messages without sensitive details
   - Process exits with error code 1

### Runtime Errors

When validation fails during request processing:

1. **Development**:

   - Redirects to `/env-error` with detailed error information
   - Shows specific error messages and troubleshooting steps

2. **Production**:
   - Redirects to `/env-error` with generic error message
   - Logs detailed errors server-side only

## Error Page (`/env-error`)

The error page provides:

- **Environment-specific guidance** (development vs production)
- **Detailed error messages** (development only)
- **Troubleshooting steps** with specific commands
- **Quick action buttons** for common tasks
- **Security-conscious** error display in production

## Usage Examples

### Basic Setup

```javascript
// Automatic validation on import (server-side only)
import "../lib/startup-validation";

// Manual validation
import { performStartupValidation } from "../lib/env-validation-middleware";
performStartupValidation();
```

### Middleware Integration

```javascript
// middleware.ts
import { envValidationMiddleware } from "./lib/env-validation-middleware";

export function middleware(request) {
  const envValidationResult = envValidationMiddleware(request);
  if (envValidationResult) {
    return envValidationResult;
  }
  // Continue with other middleware
}
```

### Configuration Loading

```javascript
import { getEnvironmentConfig } from "../lib/env-config";

const config = getEnvironmentConfig();
console.log(`Database: ${config.databaseProvider}`);
console.log(`Environment: ${config.nodeEnv}`);
```

## Testing

### Running Tests

```bash
# Run validation test suite
npm run env:test

# Validate current configuration
npm run env:validate

# Test specific environment
npm run env:validate:dev
npm run env:validate:prod
```

### Test Coverage

The test suite covers:

- ✅ Valid configurations
- ❌ Missing required variables
- ❌ Invalid database providers
- ❌ Wrong URL formats
- ❌ Production with development settings
- ❌ Incomplete OAuth configurations
- ⚠️ Development with production settings

## Troubleshooting

### Common Issues

1. **Missing .env.local file**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

2. **Invalid NEXTAUTH_SECRET**

   ```bash
   openssl rand -base64 32
   # Copy output to NEXTAUTH_SECRET
   ```

3. **Database URL format errors**

   - SQLite: `file:./dev.db`
   - PostgreSQL: `postgresql://user:pass@host:port/db`

4. **OAuth configuration incomplete**
   - Provide both client ID and secret
   - Or remove both to disable the provider

### Debug Commands

```bash
# Check environment variables
npm run env:validate

# Test validation logic
npm run env:test

# Check database connection
npm run db:validate

# View configuration template
cat .env.example
```

## Security Considerations

- **No secrets in logs**: Sensitive values are masked in output
- **Environment separation**: Different rules for dev/prod
- **Secure defaults**: Strict validation for production
- **Error message security**: Generic errors in production
- **Secret rotation**: Warnings for weak or old secrets

## Integration Points

The validation system integrates with:

- **Next.js middleware**: Runtime request validation
- **Application startup**: Server initialization validation
- **Build process**: Build-time validation in `next.config.js`
- **Development tools**: Validation scripts and testing
- **Error handling**: Custom error pages and logging

## Vercel Deployment

### Build-Time Compatibility

The validation system has been updated to handle Vercel deployments:

- **Build-Time Detection**: Automatically detects Vercel build environment
- **Minimal Configuration**: Provides fallback configurations during build
- **Prisma Generation**: Automatically runs `prisma generate` during build
- **Environment Flexibility**: Allows missing variables during build time

### Vercel-Specific Configuration

```javascript
// Automatic detection of Vercel build environment
if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE)) {
  // Use build-time compatible configuration
}
```

### Build Script Updates

The build process now includes:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Environment Variables for Vercel

Required in Vercel dashboard:

- `NEXTAUTH_URL` - Your Vercel app URL
- `NEXTAUTH_SECRET` - Secure secret (32+ characters)
- `DATABASE_URL` - Supabase connection string
- `DATABASE_PROVIDER` - Set to "postgresql"
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

Optional OAuth variables:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

## Future Enhancements

Potential improvements:

- **Configuration UI**: Web interface for environment setup
- **Health checks**: Periodic validation during runtime
- **Metrics**: Validation success/failure tracking
- **Integration tests**: End-to-end validation testing
- **Documentation generation**: Auto-generated config docs
- **Vercel Integration**: One-click environment setup for Vercel
