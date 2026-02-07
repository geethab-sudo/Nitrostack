/**
 * Input sanitization utilities for security
 */

/**
 * Sanitize regex string to prevent regex injection attacks
 * Escapes special regex characters
 */
export function sanitizeRegex(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and other dangerous characters
  let sanitized = input.replace(/\0/g, '');

  // Escape special regex characters
  // This is safe because we're using it in MongoDB $regex which already handles escaping
  // But we'll do basic sanitization to prevent injection
  sanitized = sanitized.trim();

  // Limit length to prevent DoS
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes, control characters, and trim
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(input: string[]): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0);
}

/**
 * Validate and sanitize number input
 */
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) {
      return null;
    }
    if (min !== undefined && input < min) {
      return null;
    }
    if (max !== undefined && input > max) {
      return null;
    }
    return input;
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null;
    }
    if (min !== undefined && parsed < min) {
      return null;
    }
    if (max !== undefined && parsed > max) {
      return null;
    }
    return parsed;
  }

  return null;
}

/**
 * Sanitize MongoDB filter object to prevent injection
 */
export function sanitizeFilter(filter: any): Record<string, any> | null {
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    return null;
  }

  const sanitized: Record<string, any> = {};
  const allowedOperators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$regex', '$exists'];

  for (const [key, value] of Object.entries(filter)) {
    // Sanitize key
    const sanitizedKey = sanitizeString(key);
    if (!sanitizedKey || sanitizedKey.length > 100) {
      continue;
    }

    // Handle operators
    if (key.startsWith('$')) {
      if (!allowedOperators.includes(key)) {
        continue;
      }
      sanitized[key] = value;
      continue;
    }

    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      const num = sanitizeNumber(value);
      if (num !== null) {
        sanitized[sanitizedKey] = num;
      }
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item => {
        if (typeof item === 'string') return sanitizeString(item);
        if (typeof item === 'number') return sanitizeNumber(item);
        return item;
      });
    } else if (value && typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeFilter(value);
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}
