/**
 * Global application constants
 * Use these throughout the app for easy configuration management
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Gatherly';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Create unforgettable experiences';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const APP_CONFIG = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  apiUrl: API_BASE_URL,
  supportEmail: 'support@gatherly.com',
  socialProof: 'Trusted by 10,000+ planners',
} as const;
