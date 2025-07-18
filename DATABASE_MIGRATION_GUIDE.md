# Database Migration Management Guide

This guide explains how to use the cross-database migration utilities that work with both SQLite (development) and PostgreSQL (production) environments.

## Quick Start

### Development Setup (SQLite)
```bash
# Complete setup for development
npm run db:setup:dev

# Or step by step:
npm run db:generate-schema:sqlite
npm run db:init:dev
npm run db:seed:dev
```

### Production Setup (PostgreSQL)
```bash
# Complete setup for production
npm run db:setup:postgresql

# Or step by step:
npm run db:generate-schema:postgresql
npm run db:init:prod
npm run db:seed:prod
```

## Available Commands

### Environment Detection
```bash
npm run db:status          # Show current environment configuration
```

### Database Initialization
```bash
npm run db:init            # Initialize database (auto-detects environment)
npm run db:init:dev        # Initialize for development (SQLite)
npm run db:init:prod       # Initialize for production (PostgreSQL)
```

### Schema Management
```bash
npm run db:generate-schema              # Generate schema (auto-detects provider)
npm run db:generate-schema:sqlite       # Generate SQLite schema
npm run db:generate-schema:postgresql   # Generate PostgreSQL schema
```

### Migration Management
```bash
npm run db:migrate         # Run migrations (auto-detects environment)
npm run db:migrate:dev     # Run development migrations
npm run db:migrate:prod    # Run production migrations
npm run db:create-migration <name>  # Create new migration
```

### Database Operations
```bash
npm run db:seed            # Seed database (auto-detects environment)
npm run db:seed:dev        # Seed development database
npm run db:seed:prod       # Seed production database
npm run db:reset           # Reset database (development only)
npm run db:reset:dev       # Reset development database
```

### Testing and Validation
```bash
npm run db:validate        # Test database connection and functionality
```

### Complete Workflows
```bash
npm run db:setup           # Complete setup (schema + init + seed)
npm run db:setup:dev       # Complete development setup
npm run db:setup:sqlite    # Complete SQLite setup
npm run db:setup:postgresql # Complete PostgreSQL setup
npm run db:fresh           # Reset and setup (development only)
npm run db:fresh:dev       # Fresh development setup
```

## Environment Configuration

### Development (.env.local)
```env
NODE_ENV=development
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret
```

### Production (Vercel Environment Variables)
```env
NODE_ENV=production
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Migration Utilities

### Direct Script Usage
```bash
# Environment detection
node scripts/migration-utils.js detect

# Database initialization
node scripts/migration-utils.js init

# Run migrations
node scripts/migration-utils.js migrate

# Validate connection
node scripts/migration-utils.js validate

# Create migration
node scripts/migration-utils.js create-migration <name>

# Reset database (dev only)
node scripts/migration-utils.js reset

# Seed database
node scripts/migration-utils.js seed
```

### Database Connection Testing
```bash
# Test current database connection
node scripts/test-db-connection.js

# Or use npm script
npm run db:validate
```

## Troubleshooting

### Common Issues

1. **Database file not found (SQLite)**
   - Run `npm run db:init:dev` to create the database
   - Check that DATABASE_URL points to the correct path

2. **Connection refused (PostgreSQL)**
   - Ensure PostgreSQL server is running
   - Verify DATABASE_URL connection string
   - Check firewall and network settings

3. **Authentication failed**
   - Verify username and password in DATABASE_URL
   - Check database user permissions

4. **Prisma client issues**
   - Run `npx prisma generate` to regenerate client
   - Ensure schema matches your database provider

### Environment Variable Issues
- Check `.env.local` for development settings
- Verify Vercel environment variables for production
- Use `npm run db:status` to see current configuration

## Best Practices

1. **Development Workflow**
   - Use SQLite for local development
   - Run `npm run db:fresh:dev` when you need a clean database
   - Use `npm run db:validate` to test connections

2. **Production Deployment**
   - Use PostgreSQL (Supabase) for production
   - Set environment variables in Vercel dashboard
   - Run migrations automatically during deployment

3. **Schema Changes**
   - Create migrations with descriptive names
   - Test migrations on both SQLite and PostgreSQL
   - Always backup production data before major changes

4. **Testing**
   - Use `npm run db:validate` before deployment
   - Test both database providers during development
   - Verify seed data works in both environments

## Migration File Compatibility

The migration system ensures compatibility between SQLite and PostgreSQL by:

- Using Prisma's built-in migration system
- Generating provider-specific SQL when needed
- Handling data type differences automatically
- Providing clear error messages for incompatibilities

## Deployment Integration

### Vercel Build Process
The migration utilities integrate with Vercel's build process:

1. Environment variables are loaded from Vercel
2. Schema is generated for PostgreSQL
3. Migrations are applied automatically
4. Database connection is validated

### GitHub Actions (Future)
The utilities are designed to work with CI/CD pipelines:

- Environment-aware script execution
- Proper error handling and exit codes
- Detailed logging for debugging