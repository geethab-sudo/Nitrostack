/**
 * Service for building MongoDB queries for insurance plans
 */

import { Filter } from 'mongodb';
import { InsuranceQueryParams } from '../interfaces/insurance.interfaces.js';
import { INSURANCE_CONSTANTS } from '../config/insurance.config.js';
import { sanitizeFilter } from '../utils/input-sanitizer.js';

/**
 * Service for building insurance queries
 */
export class InsuranceQueryBuilderService {
  /**
   * Build query for listing insurance plans
   */
  public buildListQuery(params: InsuranceQueryParams): Filter<any> {
    const query: Filter<any> = {};

    // Add custom filter if provided
    if (params.filter) {
      const sanitizedFilter = sanitizeFilter(params.filter);
      if (sanitizedFilter) {
        Object.assign(query, sanitizedFilter);
      }
    }

    // Filter by salary - premium should be affordable
    if (params.salary !== undefined && params.salary > 0) {
      const maxAffordablePremium = params.salary * INSURANCE_CONSTANTS.MAX_AFFORDABLE_PREMIUM_RATIO;
      query.premium = { $lte: maxAffordablePremium };
    }

    // Filter by family members
    if (params.familyMembers !== undefined && params.familyMembers !== null) {
      if (params.familyMembers > 1) {
        // If more than 1 family member, prefer plans with family coverage
        query.$or = [
          { familyCoverage: true },
          { maxFamilyMembers: { $gte: params.familyMembers } },
        ];
      } else {
        // If single person, can use individual or family plans
        query.$or = [
          { familyCoverage: false },
          { familyCoverage: { $exists: false } },
          { maxFamilyMembers: { $gte: 1 } },
        ];
      }
    }

    // Filter by age - match plans where user's age is within the plan's age range
    if (params.age !== undefined && params.age !== null) {
      query.$and = query.$and || [];
      // Plan matches if: (minAge doesn't exist OR user age >= minAge) AND (maxAge doesn't exist OR user age <= maxAge)
      query.$and.push({
        $or: [
          { minAge: { $exists: false } },
          { minAge: { $lte: params.age } },
        ],
      });
      query.$and.push({
        $or: [
          { maxAge: { $exists: false } },
          { maxAge: { $gte: params.age } },
        ],
      });
    }

    return query;
  }

  /**
   * Build query for suggesting insurance plans based on user profile
   * This query filters plans that are potentially suitable before scoring
   */
  public buildSuggestionQuery(params: {
    age: number;
    salary: number;
    familyMembers: number;
    deficiencies?: string[];
    insuranceType?: string;
  }): Filter<any> {
    const query: Filter<any> = {};

    // Premium should be affordable (less than 10% of salary)
    const maxAffordablePremium = params.salary * INSURANCE_CONSTANTS.MAX_AFFORDABLE_PREMIUM_RATIO;
    query.premium = { $lte: maxAffordablePremium };

    // Build $and conditions array
    const andConditions: any[] = [];

    // Filter by insurance type if provided
    if (params.insuranceType) {
      andConditions.push({
        $or: [
          { type: params.insuranceType },
          { category: params.insuranceType },
        ],
      });
    }

    // Age range matching - always required
    andConditions.push({
      $or: [
        { minAge: { $exists: false } },
        { minAge: { $lte: params.age } },
      ],
    });
    andConditions.push({
      $or: [
        { maxAge: { $exists: false } },
        { maxAge: { $gte: params.age } },
      ],
    });

    // Family coverage matching
    if (params.familyMembers > 1) {
      andConditions.push({
        $or: [
          { familyCoverage: true },
          { maxFamilyMembers: { $gte: params.familyMembers } },
        ],
      });
    }

    // If user has deficiencies, prefer plans that cover pre-existing conditions
    // But don't exclude plans that don't specify this field
    if (params.deficiencies && params.deficiencies.length > 0) {
      andConditions.push({
        $or: [
          { coversPreExisting: true },
          { coversPreExisting: { $exists: false } },
        ],
      });
    }

    // Add $and if we have conditions
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    return query;
  }
}
