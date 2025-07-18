# GitHub Actions Workflows

This project uses GitHub Actions for automated testing and deployment.

## Workflows

### 1. Deploy to Vercel (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch → Production deployment
- Push to `develop` branch → Preview deployment
- Pull requests → Preview deployment

**Jobs:**
1. **Test** - Validates environment, builds application, runs linting
2. **Deploy Preview** - Deploys to Vercel preview environment (PRs)
3. **Deploy Production** - Deploys to Vercel production environment (main branch)
4. **Notify** - Reports deployment status

### 2. Development Environment Tests (`.github/workflows/dev-tests.yml`)

**Triggers:**
- Push to `develop` branch
- Pull requests to `develop` branch

**Jobs:**
1. **Test Development** - Tests SQLite development environment setup

## Required Secrets

Configure these secrets in your GitHub repository settings:

- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Environment-Specific Triggers

- **Development**: SQLite database, local environment variables
- **Preview**: PostgreSQL database, preview environment variables
- **Production**: PostgreSQL database, production environment variables

## Manual Triggers

You can manually trigger workflows from the GitHub Actions tab:
1. Go to Actions tab in your repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"
