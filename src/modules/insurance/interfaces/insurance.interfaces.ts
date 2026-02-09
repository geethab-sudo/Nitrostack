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
 * Simplified insurance item for listing
 */
export interface InsuranceListItem {
  name: string;
  description: string;
  policyId: string;
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
  insurance: InsuranceListItem[];
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
  age?: number;
  salary?: number;
  designation?: string;
  familyMembers?: FamilyMember[];
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
  policyNumber?: string; // Policy number from insurance plan
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
 * Input for book_insurance_with_user tool
 */
export interface BookInsuranceWithUserInput {
  policyNumber: string;
  email: string;
  name: string;
  phoneNumber: string;
  paymentMethod?: string;
  startDate?: string;
  years?: number;
  transactionId?: string;
  notes?: string;
}

/**
 * Response from book_insurance_with_user tool
 */
export interface BookInsuranceWithUserResponse {
  success: boolean;
  booking: Booking;
  user: User;
  isNewUser: boolean;
}

/**
 * Input for list_booking_status_by_email tool
 */
export interface ListBookingStatusByEmailInput {
  email: string;
}

/**
 * Response from list_booking_status_by_email tool
 */
export interface ListBookingStatusByEmailResponse {
  success: boolean;
  user: User;
  bookings: Booking[];
  count: number;
}
