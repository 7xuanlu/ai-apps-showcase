/**
 * Environment Configuration and Validation Utility
 *
 * This module provides centralized environment variable management and validation
 * for the Next.js application with support for both development (SQLite) and
 * production (Supabase PostgreSQL) environments.
 */

export type Environment = "development" | "production" | "test";
export type DatabaseProvider = "sqlite" | "postgresql";

export interface EnvironmentConfig {
  nodeEnv: Environment;
  databaseUrl: string;
  databaseProvider: DatabaseProvider;
  nextAuthUrl: string;
  nextAuthSecret: string;
  supabaseConfig?: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  oauthProviders?: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

export interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
  connectionLimit?: number;
  ssl?: boolean;
  schema?: string;
}

/**
 * Required environment variables for different environments
 */
const REQUIRED_VARS = {
  base: [
    "NODE_ENV",
    "DATABASE_PROVIDER",
    "DATABASE_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
  ],
  development: [],
  production: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
} as const;

/**
 * Validates that all required environment variables are present
 */
function validateRequiredVariables(env: Environment): void {
  const requiredVars = [...REQUIRED_VARS.base, ...REQUIRED_VARS[env]];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = [
      `❌ Missing required environment variables for ${env} environment:`,
      ...missingVars.map((varName) => `  - ${varName}`),
      "",
      "Please check your environment configuration:",
      env === "development"
        ? "  - Ensure .env.local file exists with required variables"
        : "  - Ensure production environment variables are set in Vercel",
      "",
      "See .env.example for required variable templates.",
    ].join("\n");

    throw new Error(errorMessage);
  }
}

/**
 * Validates database provider and URL compatibility
 */
function validateDatabaseConfig(provider: string, url: string): void {
  if (!["sqlite", "postgresql"].includes(provider)) {
    throw new Error(
      `❌ Invalid DATABASE_PROVIDER: "${provider}". Must be "sqlite" or "postgresql"`
    );
  }

  if (provider === "sqlite" && !url.startsWith("file:")) {
    throw new Error(
      `❌ SQLite DATABASE_URL must start with "file:" but got: "${url}"`
    );
  }

  if (provider === "postgresql" && !url.startsWith("postgres")) {
    throw new Error(
      `❌ PostgreSQL DATABASE_URL must start with "postgres" but got: "${url}"`
    );
  }
}

/**
 * Detects the current environment from NODE_ENV
 */
export function detectEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();

  switch (nodeEnv) {
    case "development":
      return "development";
    case "production":
      return "production";
    case "test":
      return "test";
    default:
      console.warn(
        `⚠️  Unknown NODE_ENV: "${nodeEnv}", defaulting to development`
      );
      return "development";
  }
}

/**
 * Generates database URL based on environment and provider
 */
export function generateDatabaseUrl(
  env: Environment,
  provider: DatabaseProvider
): string {
  if (provider === "sqlite") {
    // For SQLite, use local file in development
    return env === "development" ? "file:./dev.db" : "file:./prod.db";
  }

  if (provider === "postgresql") {
    // For PostgreSQL, expect full connection string from environment
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is required for PostgreSQL provider");
    }
    return url;
  }

  throw new Error(`Unsupported database provider: ${provider}`);
}

/**
 * Creates database configuration object
 */
export function createDatabaseConfig(env: Environment): DatabaseConfig {
  const provider = process.env.DATABASE_PROVIDER as DatabaseProvider;
  const url = process.env.DATABASE_URL!;

  validateDatabaseConfig(provider, url);

  const config: DatabaseConfig = {
    provider,
    url,
  };

  // Add production-specific optimizations
  if (env === "production" && provider === "postgresql") {
    config.connectionLimit = 10;
    config.ssl = true;
  }

  return config;
}

/**
 * Validates and loads complete environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();

  // Validate required variables
  validateRequiredVariables(env);

  // Create database configuration
  const dbConfig = createDatabaseConfig(env);

  // Build complete configuration
  const config: EnvironmentConfig = {
    nodeEnv: env,
    databaseUrl: dbConfig.url,
    databaseProvider: dbConfig.provider,
    nextAuthUrl: process.env.NEXTAUTH_URL!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  };

  // Add Supabase configuration for production
  if (env === "production" && process.env.SUPABASE_URL) {
    config.supabaseConfig = {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  // Add OAuth provider configuration if available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    config.oauthProviders = config.oauthProviders || {};
    config.oauthProviders.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    config.oauthProviders = config.oauthProviders || {};
    config.oauthProviders.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }

  return config;
}

/**
 * Validates environment configuration at startup
 * Call this early in your application lifecycle
 */
export function validateEnvironment(): void {
  try {
    const config = loadEnvironmentConfig();
    console.log(
      `✅ Environment configuration loaded successfully for ${config.nodeEnv}`
    );
    console.log(
      `📊 Database: ${config.databaseProvider} (${config.databaseUrl})`
    );
  } catch (error) {
    console.error("Environment validation failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Export the loaded configuration as a singleton
let _config: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!_config) {
    _config = loadEnvironmentConfig();
  }
  return _config;
}
