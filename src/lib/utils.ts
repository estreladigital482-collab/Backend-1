import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Data Sanitization Utilities for Frontend
 * Prevents sensitive data leakage to external LLM providers
 */

// Patterns for sensitive data (same as backend)
const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  // JWT Tokens (test first since they contain dots)
  [/eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/g, '[JWT_TOKEN_REDACTED]'],

  // API Keys
  [/\b[A-Za-z0-9]{32,}\b/g, '[API_KEY_REDACTED]'],
  [/\b[A-Za-z0-9_-]{20,}\b/g, '[API_KEY_REDACTED]'],

  // Password patterns
  [/password["\s]*:[\s]*["'][^"']+["']/gi, 'password: "[PASSWORD_REDACTED]"'],
  [/PASSWORD["\s]*:[\s]*["'][^"']+["']/gi, 'PASSWORD: "[PASSWORD_REDACTED]"'],

  // Database URLs
  [/postgresql:\/\/[^:]+:[^@]+@/gi, 'postgresql://[USER]:[PASSWORD]@'],
  [/mysql:\/\/[^:]+:[^@]+@/gi, 'mysql://[USER]:[PASSWORD]@'],

  // Environment variables
  [/\b(API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|BEARER_TOKEN)["\s]*=[\s]*["'][^"']*["']/gi,
   '[REDACTED]'],

  // Email addresses
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, '[EMAIL_REDACTED]'],

  // Internal IP addresses
  [/\b(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.0\.0\.1)\d{1,3}\.\d{1,3}\b/g,
   '[INTERNAL_IP_REDACTED]'],

  // Phone numbers
  [/\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REDACTED]'],
];

export function sanitizeText(text: string): string {
  if (!text) return text;

  let sanitized = text;
  for (const [pattern, replacement] of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

export function sanitizeMemoryContent(content: string): string {
  if (!content) return content;

  let sanitized = sanitizeText(content);

  // Additional memory-specific patterns
  const memoryPatterns: Array<[RegExp, string]> = [
    [/\.env.*?(?=\n\n|\n#|\n$|$)/gi, '[CONFIG_FILE_CONTENT_REDACTED]'],
    [/DATABASE_URL.*?=.*?["'][^"']*["']/gi, 'DATABASE_URL="[DATABASE_URL_REDACTED]"'],
    [/(SUPABASE_.*_KEY).*?=.*?["'][^"']*["']/gi, '[SUPABASE_KEY_REDACTED]'],
  ];

  for (const [pattern, replacement] of memoryPatterns) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  return sanitized;
}

export function sanitizeMessages(messages: Array<{role: string, content: string}>): Array<{role: string, content: string}> {
  return messages.map(msg => ({
    ...msg,
    content: sanitizeMemoryContent(msg.content)
  }));
}

export class DataSanitizer {
  static sanitizeText = sanitizeText;
  static sanitizeMemoryContent = sanitizeMemoryContent;
  static sanitizeMessages = sanitizeMessages;
}
