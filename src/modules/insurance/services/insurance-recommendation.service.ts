/**
 * Service for generating insurance recommendations
 */

import { UserProfile } from '../interfaces/insurance.interfaces.js';

/**
 * Service for generating recommendation text
 */
export class InsuranceRecommendationService {
  /**
   * Generate recommendation text based on user profile
   */
  public generateRecommendations(userProfile: UserProfile): string {
    const recommendations: string[] = [];

    recommendations.push('Based on your profile:');

    if (userProfile.familyMembers > 1) {
      recommendations.push(
        `- We recommend family insurance plans covering ${userProfile.familyMembers} members.`
      );
    }

    if (userProfile.deficiencies && userProfile.deficiencies.length > 0) {
      recommendations.push(
        `- Consider plans that cover pre-existing conditions: ${userProfile.deficiencies.join(', ')}.`
      );
    }

    if (userProfile.salary > 0) {
      const affordablePremium = userProfile.salary * 0.05;
      recommendations.push(
        `- Affordable premium range: up to ${Math.round(affordablePremium)} per year (5% of salary).`
      );
    }

    // Add age-based recommendation
    if (userProfile.age < 30) {
      recommendations.push('- As a young adult, consider plans with lower premiums and good coverage.');
    } else if (userProfile.age >= 50) {
      recommendations.push('- Consider comprehensive health coverage with focus on preventive care.');
    }

    return recommendations.join('\n');
  }
}
