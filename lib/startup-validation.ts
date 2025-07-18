/**
 * Application Startup Validation
 * 
 * This module handles environment validation that runs when the application starts.
 * It ensures all required environment variables are present and properly configured
 * before the application begins serving requests.
 */

import { performStartupValidation } from './env-validation-middleware'

/**
 * Initialize application with environment validation
 * This should be called as early as possible in the application lifecycle
 */
export function initializeApplication(): void {
  try {
    // Perform environment validation at startup
    performStartupValidation()
    
    // Additional startup checks can be added here
    console.log('🎉 Application initialization completed successfully')
  } catch (error) {
    console.error('💥 Application initialization failed:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Auto-initialize when this module is imported (for server-side)
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  // Only run on server-side (Node.js environment) and not during build
  initializeApplication()
}