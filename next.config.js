/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variable validation
  env: {
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
  },

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    
    // Database connection optimization for production
    experimental: {
      serverComponentsExternalPackages: ['@prisma/client'],
    },
    
    // Build-time environment variable validation
    webpack: (config, { isServer }) => {
      if (isServer && process.env.NODE_ENV === 'production') {
        // Validate required environment variables at build time
        const requiredEnvVars = [
          'DATABASE_URL',
          'DATABASE_PROVIDER',
          'NEXTAUTH_URL',
          'NEXTAUTH_SECRET'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
          throw new Error(
            `Missing required environment variables for production build: ${missingVars.join(', ')}\n` +
            'Please configure these variables in your Vercel deployment settings.'
          );
        }

        // Validate database provider
        if (process.env.DATABASE_PROVIDER !== 'postgresql') {
          console.warn(
            'Warning: DATABASE_PROVIDER should be "postgresql" for production builds. ' +
            `Current value: ${process.env.DATABASE_PROVIDER}`
          );
        }

        // Validate database URL format for production
        if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
          throw new Error(
            'DATABASE_URL must be a PostgreSQL connection string for production builds. ' +
            'Expected format: postgresql://user:password@host:port/database'
          );
        }
      }
      
      return config;
    },
  }),

  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    // Enable source maps in development
    productionBrowserSourceMaps: false,
    
    // Faster builds in development
    swcMinify: false,
  }),

  // Headers for security and performance
  async headers() {
    const headers = [];
    
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      });
    }
    
    return headers;
  },

  // Redirects for production
  async redirects() {
    return [];
  },

  // Image optimization
  images: {
    domains: [],
    ...(process.env.NODE_ENV === 'production' && {
      formats: ['image/webp', 'image/avif'],
    }),
  },
}

module.exports = nextConfig 