/**
 * Tests for Insurance Scoring Service
 */

import { InsuranceScoringService } from '../services/insurance-scoring.service.js';
import { InsurancePlan, UserProfile } from '../interfaces/insurance.interfaces.js';

describe('InsuranceScoringService', () => {
  let scoringService: InsuranceScoringService;

  beforeEach(() => {
    scoringService = new InsuranceScoringService();
  });

  describe('calculateScore', () => {
    it('should calculate high score for plan matching all criteria', () => {
      const plan: InsurancePlan = {
        _id: '1',
        name: 'Perfect Plan',
        premium: 10000,
        minAge: 25,
        maxAge: 65,
        familyCoverage: true,
        coversPreExisting: true,
      };

      const userProfile: UserProfile = {
        age: 35,
        salary: 500000,
        familyMembers: 4,
        deficiencies: ['diabetes'],
      };

      const result = scoringService.calculateScore(plan, userProfile);

      expect(result.matchScore).toBeGreaterThan(70);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should calculate lower score for plan with high premium', () => {
      const plan: InsurancePlan = {
        _id: '1',
        name: 'Expensive Plan',
        premium: 100000, // 20% of salary
        minAge: 25,
        maxAge: 65,
      };

      const userProfile: UserProfile = {
        age: 35,
        salary: 500000,
        familyMembers: 1,
        deficiencies: [],
      };

      const result = scoringService.calculateScore(plan, userProfile);

      expect(result.matchScore).toBeLessThan(50);
    });

    it('should penalize plans that do not cover pre-existing conditions', () => {
      const plan: InsurancePlan = {
        _id: '1',
        name: 'No Pre-existing',
        premium: 10000,
        coversPreExisting: false,
      };

      const userProfile: UserProfile = {
        age: 35,
        salary: 500000,
        familyMembers: 1,
        deficiencies: ['diabetes'],
      };

      const result = scoringService.calculateScore(plan, userProfile);

      expect(result.matchScore).toBeLessThan(30);
      expect(result.reasons.some(r => r.includes('Does not cover'))).toBe(true);
    });
  });
});
