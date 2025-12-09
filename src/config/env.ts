/**
 * Environment configuration
 * Access environment variables through this module
 */

export const ENV = {
  APP_ENV: process.env.APP_ENV || 'development',
  IS_DEV: process.env.APP_ENV !== 'production',
  IS_PROD: process.env.APP_ENV === 'production',
} as const;

export type Environment = typeof ENV;
