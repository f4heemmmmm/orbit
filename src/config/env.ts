/**
 * Environment configuration
 * Access environment variables through this module
 */

export const ENV = {
  APP_ENV: process.env.APP_ENV || 'development',
  IS_DEV: process.env.APP_ENV !== 'production',
  IS_PROD: process.env.APP_ENV === 'production',

  // Supabase Configuration
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

export type Environment = typeof ENV;

/**
 * Validate that required environment variables are set
 */
export function validateEnv(): void {
  const required = {
    SUPABASE_URL: ENV.SUPABASE_URL,
    SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and make sure all required variables are set.'
    );
  }
}
