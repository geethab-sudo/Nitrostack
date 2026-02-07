/**
 * Tests for Input Sanitizer
 */

import {
  sanitizeRegex,
  sanitizeString,
  sanitizeStringArray,
  sanitizeNumber,
  sanitizeFilter,
} from '../utils/input-sanitizer.js';

describe('Input Sanitizer', () => {
  describe('sanitizeRegex', () => {
    it('should sanitize regex input', () => {
      const input = 'health insurance';
      const result = sanitizeRegex(input);
      expect(result).toBe('health insurance');
    });

    it('should handle empty string', () => {
      const result = sanitizeRegex('');
      expect(result).toBe('');
    });

    it('should limit length', () => {
      const longInput = 'a'.repeat(2000);
      const result = sanitizeRegex(longInput);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeString', () => {
    it('should remove null bytes', () => {
      const input = 'test\0string';
      const result = sanitizeString(input);
      expect(result).not.toContain('\0');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = sanitizeString(input);
      expect(result).toBe('test');
    });
  });

  describe('sanitizeStringArray', () => {
    it('should sanitize array of strings', () => {
      const input = ['diabetes', 'hypertension', '  asthma  '];
      const result = sanitizeStringArray(input);
      expect(result).toEqual(['diabetes', 'hypertension', 'asthma']);
    });

    it('should filter out invalid entries', () => {
      const input = ['valid', '', null as any, undefined as any, 123 as any];
      const result = sanitizeStringArray(input);
      expect(result).toEqual(['valid']);
    });
  });

  describe('sanitizeNumber', () => {
    it('should validate number within range', () => {
      const result = sanitizeNumber(50, 0, 100);
      expect(result).toBe(50);
    });

    it('should return null for number outside range', () => {
      const result = sanitizeNumber(150, 0, 100);
      expect(result).toBeNull();
    });

    it('should parse string numbers', () => {
      const result = sanitizeNumber('50', 0, 100);
      expect(result).toBe(50);
    });

    it('should return null for invalid input', () => {
      const result = sanitizeNumber('invalid', 0, 100);
      expect(result).toBeNull();
    });
  });

  describe('sanitizeFilter', () => {
    it('should sanitize valid filter object', () => {
      const filter = {
        name: 'test',
        premium: 1000,
        active: true,
      };
      const result = sanitizeFilter(filter);
      expect(result).toEqual(filter);
    });

    it('should handle operators', () => {
      const filter = {
        premium: { $gte: 1000, $lte: 5000 },
      };
      const result = sanitizeFilter(filter);
      expect(result).toEqual(filter);
    });

    it('should return null for invalid filter', () => {
      const filter = null as any;
      const result = sanitizeFilter(filter);
      expect(result).toBeNull();
    });
  });
});
