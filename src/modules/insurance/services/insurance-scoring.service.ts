/**
 * Service for scoring insurance plans based on user profile
 */

import { InsurancePlan, ScoredInsurancePlan, UserProfile } from '../interfaces/insurance.interfaces.js';
import { InsuranceConfig, INSURANCE_CONSTANTS } from '../config/insurance.config.js';

/**
 * Service for calculating match scores for insurance plans
 */
export class InsuranceScoringService {
  private config: ReturnType<typeof InsuranceConfig.getInstance>;
  private weights: ReturnType<ReturnType<typeof InsuranceConfig.getInstance>['getScoringWeights']>;

  constructor() {
    this.config = InsuranceConfig.getInstance();
    this.weights = this.config.getScoringWeights();
  }

  /**
   * Calculate match score for an insurance plan based on user profile
   */
  public calculateScore(plan: InsurancePlan, userProfile: UserProfile): ScoredInsurancePlan {
    let matchScore = 0;
    const reasons: string[] = [];

    // Age-based matching
    const ageScore = this.scoreAge(plan, userProfile.age);
    matchScore += ageScore.score;
    if (ageScore.reason) reasons.push(ageScore.reason);

    // Salary-based matching (premium affordability)
    const premiumScore = this.scorePremium(plan, userProfile.salary);
    matchScore += premiumScore.score;
    if (premiumScore.reason) reasons.push(premiumScore.reason);

    // Family members matching
    const familyScore = this.scoreFamilyCoverage(plan, userProfile.familyMembers);
    matchScore += familyScore.score;
    if (familyScore.reason) reasons.push(familyScore.reason);

    // Deficiencies/pre-existing conditions matching
    if (userProfile.deficiencies && userProfile.deficiencies.length > 0) {
      const deficiencyScore = this.scoreDeficiencies(plan, userProfile.deficiencies);
      matchScore += deficiencyScore.score;
      if (deficiencyScore.reason) reasons.push(deficiencyScore.reason);
    }

    // Type-based matching (if user has deficiencies, prioritize health insurance)
    if (userProfile.deficiencies && userProfile.deficiencies.length > 0) {
      if (plan.type === 'Health' || plan.category === 'Health') {
        matchScore += this.weights.typeMatch;
        reasons.push('Health insurance type matches your needs');
      }
    }

    // Ensure score is within bounds
    const finalScore = Math.min(
      INSURANCE_CONSTANTS.MAX_MATCH_SCORE,
      Math.max(INSURANCE_CONSTANTS.MIN_MATCH_SCORE, matchScore)
    );

    return {
      ...plan,
      matchScore: finalScore,
      reasons,
    };
  }

  /**
   * Score based on age matching
   */
  private scoreAge(plan: InsurancePlan, userAge: number): { score: number; reason?: string } {
    if (plan.minAge && plan.maxAge) {
      if (userAge >= plan.minAge && userAge <= plan.maxAge) {
        return {
          score: this.weights.age,
          reason: `Age appropriate (${plan.minAge}-${plan.maxAge} years)`,
        };
      }
    } else if (plan.minAge && userAge >= plan.minAge) {
      return {
        score: this.weights.age,
        reason: `Age appropriate (min ${plan.minAge} years)`,
      };
    } else if (plan.maxAge && userAge <= plan.maxAge) {
      return {
        score: this.weights.age,
        reason: `Age appropriate (max ${plan.maxAge} years)`,
      };
    }

    return { score: 0 };
  }

  /**
   * Score based on premium affordability
   */
  private scorePremium(plan: InsurancePlan, salary: number): { score: number; reason?: string } {
    if (!plan.premium || salary <= 0) {
      return { score: 0 };
    }

    const premiumRatio = plan.premium / salary;

    if (premiumRatio <= INSURANCE_CONSTANTS.HIGHLY_AFFORDABLE_PREMIUM_RATIO) {
      return {
        score: this.weights.premium,
        reason: 'Highly affordable premium',
      };
    } else if (premiumRatio <= INSURANCE_CONSTANTS.MAX_AFFORDABLE_PREMIUM_RATIO) {
      return {
        score: Math.floor(this.weights.premium * 0.6),
        reason: 'Moderate premium',
      };
    } else {
      return {
        score: Math.floor(this.weights.premium * 0.2),
        reason: 'Premium may be high for your salary',
      };
    }
  }

  /**
   * Score based on family coverage
   */
  private scoreFamilyCoverage(plan: InsurancePlan, familyMembers: number): { score: number; reason?: string } {
    if (plan.familyCoverage !== undefined) {
      if (plan.familyCoverage === true && familyMembers > 1) {
        return {
          score: this.weights.familyCoverage,
          reason: 'Covers family members',
        };
      } else if (plan.familyCoverage === false && familyMembers === 1) {
        return {
          score: this.weights.familyCoverage,
          reason: 'Individual plan suitable',
        };
      }
    } else if (plan.maxFamilyMembers) {
      if (familyMembers <= plan.maxFamilyMembers) {
        return {
          score: this.weights.familyCoverage,
          reason: `Covers up to ${plan.maxFamilyMembers} family members`,
        };
      }
    }

    return { score: 0 };
  }

  /**
   * Score based on deficiencies/pre-existing conditions
   */
  private scoreDeficiencies(plan: InsurancePlan, deficiencies: string[]): { score: number; reason?: string } {
    let score = 0;
    const reasons: string[] = [];

    if (plan.coversPreExisting === true) {
      score += this.weights.preExistingConditions;
      reasons.push('Covers pre-existing conditions');
    } else if (plan.coversPreExisting === false) {
      score -= 10; // Penalty
      reasons.push('Does not cover pre-existing conditions');
    }

    // Check if plan covers specific conditions
    if (plan.coveredConditions && Array.isArray(plan.coveredConditions)) {
      const coveredDeficiencies = deficiencies.filter((def: string) =>
        plan.coveredConditions!.some((cond: string) =>
          cond.toLowerCase().includes(def.toLowerCase()) ||
          def.toLowerCase().includes(cond.toLowerCase())
        )
      );

      if (coveredDeficiencies.length > 0) {
        score += this.weights.specificConditions;
        reasons.push(`Covers: ${coveredDeficiencies.join(', ')}`);
      }
    }

    return {
      score: Math.max(0, score),
      reason: reasons.join('; '),
    };
  }
}
