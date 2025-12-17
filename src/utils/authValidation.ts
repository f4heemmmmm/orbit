/**
 * Authentication validation utilities
 * Provides validation for email, password, and auth error message mapping
 */

// Email validation regex - standard RFC 5322 compliant pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const MIN_PASSWORD_LENGTH = 6;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate password for sign-in (basic check)
 */
export function validatePasswordForSignIn(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  return { isValid: true, error: null };
}

/**
 * Validate password for sign-up (with strength requirements)
 */
export function validatePasswordForSignUp(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate full name
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Please enter your full name' };
  }

  return { isValid: true, error: null };
}

/**
 * Map Supabase auth errors to user-friendly messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Invalid credentials
    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      return 'Incorrect email or password. Please try again.';
    }

    // User not found
    if (message.includes('user not found')) {
      return 'No account found with this email. Please sign up first.';
    }

    // Email already registered
    if (
      message.includes('user already registered') ||
      message.includes('already exists') ||
      message.includes('duplicate')
    ) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    // Email not confirmed
    if (message.includes('email not confirmed') || message.includes('not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for a confirmation link.';
    }

    // Weak password
    if (message.includes('weak password') || message.includes('password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }

    // Rate limiting
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('exceeded')
    ) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    // Network/connection errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('internet')
    ) {
      return 'Unable to connect. Please check your internet connection and try again.';
    }

    // Timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Request timed out. Please check your connection and try again.';
    }

    // Invalid email format (from Supabase)
    if (message.includes('invalid email') || message.includes('valid email')) {
      return 'Please enter a valid email address.';
    }

    // Generic auth error with message
    if (message.length > 0 && message.length < 100) {
      // Return the original message if it's reasonably short and not too technical
      if (!message.includes('supabase') && !message.includes('postgres')) {
        return error.message;
      }
    }
  }

  // Handle objects with error property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Check for Supabase error structure
    if (typeof errorObj.message === 'string') {
      return getAuthErrorMessage(new Error(errorObj.message));
    }

    // Check for error code
    if (typeof errorObj.code === 'string') {
      const code = errorObj.code.toLowerCase();

      if (code === 'invalid_credentials') {
        return 'Incorrect email or password. Please try again.';
      }
      if (code === 'user_not_found') {
        return 'No account found with this email. Please sign up first.';
      }
      if (code === 'email_not_confirmed') {
        return 'Please verify your email address before signing in.';
      }
      if (code === 'over_request_rate_limit') {
        return 'Too many attempts. Please wait a moment and try again.';
      }
    }
  }

  // Default fallback
  return 'Something went wrong. Please try again.';
}

/**
 * Check if error is a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('internet') ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('offline')
    );
  }
  return false;
}
