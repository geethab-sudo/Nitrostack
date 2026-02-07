/**
 * TypeScript interfaces for Insurance module
 */

/**
 * Insurance Plan document structure in MongoDB
 */
export interface InsurancePlan {
  _id: string;
  name: string;
  type?: string;
  category?: string;
  premium: number;
  coverage?: number;
  minAge?: number;
  maxAge?: number;
  familyCoverage?: boolean;
  maxFamilyMembers?: number;
  coversPreExisting?: boolean;
  coveredConditions?: string[];
  policyNumber?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Input for list_insurance tool
 */
export interface ListInsuranceInput {
  salary: number;
  familyMembers?: number;
  age?: number;
  limit?: number;
  skip?: number;
  filter?: Record<string, any>;
}

/**
 * Response from list_insurance tool
 */
export interface ListInsuranceResponse {
  success: boolean;
  count: number;
  total: number;
  limit: number;
  skip: number;
  insurance: InsurancePlan[];
}

/**
 * Input for search_insurance_names tool
 */
export interface SearchInsuranceNamesInput {
  searchQuery?: string;
  limit?: number;
}

/**
 * Insurance name with ID
 */
export interface InsuranceName {
  name: string;
  id: string;
}

/**
 * Response from search_insurance_names tool
 */
export interface SearchInsuranceNamesResponse {
  success: boolean;
  count: number;
  searchQuery: string;
  insuranceNames: InsuranceName[];
}

/**
 * Input for suggest_insurance_plan tool
 */
export interface SuggestInsurancePlanInput {
  age: number;
  salary: number;
  familyMembers: number;
  deficiencies?: string[];
  insuranceType?: string;
}

/**
 * Scored insurance plan with match score and reasons
 */
export interface ScoredInsurancePlan extends InsurancePlan {
  matchScore: number;
  reasons: string[];
}

/**
 * User profile for insurance suggestions
 */
export interface UserProfile {
  age: number;
  salary: number;
  familyMembers: number;
  deficiencies: string[];
  insuranceType?: string;
}

/**
 * Response from suggest_insurance_plan tool
 */
export interface SuggestInsurancePlanResponse {
  success: boolean;
  userProfile: UserProfile;
  suggestedPlans: ScoredInsurancePlan[];
  recommendations: string;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  uri: string;
  databaseName: string;
  collectionName: string;
  maxPoolSize?: number;
  minPoolSize?: number;
  connectTimeoutMS?: number;
  serverSelectionTimeoutMS?: number;
}

/**
 * Scoring weights for insurance plan matching
 */
export interface ScoringWeights {
  age: number;
  premium: number;
  familyCoverage: number;
  preExistingConditions: number;
  specificConditions: number;
  typeMatch: number;
}

/**
 * Query parameters for building MongoDB queries
 */
export interface InsuranceQueryParams {
  salary?: number;
  familyMembers?: number;
  age?: number;
  filter?: Record<string, any>;
}

/**
 * Family member information
 */
export interface FamilyMember {
  name: string;
  age: number;
  relationship: string; // e.g., "spouse", "child", "parent"
  [key: string]: any;
}

/**
 * User document structure in MongoDB
 */
export interface User {
  _id?: string;
  name: string;
  age: number;
  salary: number;
  designation: string;
  familyMembers: FamilyMember[];
  email: string; // Required field - primary identifier
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Allow additional fields
}

/**
 * Booking status enum
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'active';

/**
 * Booking document structure in MongoDB
 */
export interface Booking {
  _id?: string;
  userId: string; // Reference to User _id
  insurancePlanId: string; // Reference to InsurancePlan _id
  status: BookingStatus;
  premium: number;
  coverageAmount: number;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // Allow additional fields
}

/**
 * Input for book_insurance tool
 */
export interface BookInsuranceInput {
  userId: string;
  schemeId: string;
  paymentMethod?: string;
  startDate?: string;
  years?: number;
  transactionId?: string;
  notes?: string;
}

/**
 * Response from book_insurance tool
 */
export interface BookInsuranceResponse {
  success: boolean;
  booking: Booking;
}
