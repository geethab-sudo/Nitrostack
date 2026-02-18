import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { ObjectId } from 'mongodb';
import { MongoDBService } from './services/mongodb.service.js';
import { InsuranceQueryBuilderService } from './services/insurance-query-builder.service.js';
import { InsuranceScoringService } from './services/insurance-scoring.service.js';
import { InsuranceRecommendationService } from './services/insurance-recommendation.service.js';
import { CacheService } from './services/cache.service.js';
import { MetricsService } from './services/metrics.service.js';
import { sanitizeRegex, sanitizeStringArray, sanitizeNumber, sanitizeString } from './utils/input-sanitizer.js';
import { convertObjectIdsToString, convertObjectIdToString } from './utils/object-id.util.js';
import {
  ListInsuranceInput,
  ListInsuranceResponse,
  InsuranceListItem,
  SuggestInsurancePlanInput,
  SuggestInsurancePlanResponse,
  BookInsuranceWithUserInput,
  BookInsuranceWithUserResponse,
  ListBookingStatusByEmailInput,
  ListBookingStatusByEmailResponse,
  UserProfile,
  InsurancePlan,
  ScoredInsurancePlan,
  Booking,
  User,
} from './interfaces/insurance.interfaces.js';
import {
  DatabaseQueryError,
  InvalidInputError,
} from './errors/insurance.errors.js';
import { INSURANCE_CONSTANTS } from './config/insurance.config.js';

/**
 * Insurance Tools
 * 
 * Provides tools for listing, searching, and suggesting insurance plans.
 * Uses MongoDB for data storage and implements caching, metrics, and proper error handling.
 */
export class InsuranceTools {
  private readonly mongoService: MongoDBService;
  private readonly queryBuilder: InsuranceQueryBuilderService;
  private readonly scoringService: InsuranceScoringService;
  private readonly recommendationService: InsuranceRecommendationService;
  private readonly cacheService: CacheService;
  private readonly metricsService: MetricsService;

  constructor() {
    this.mongoService = MongoDBService.getInstance();
    this.queryBuilder = new InsuranceQueryBuilderService();
    this.scoringService = new InsuranceScoringService();
    this.recommendationService = new InsuranceRecommendationService();
    this.cacheService = CacheService.getInstance();
    this.metricsService = MetricsService.getInstance();
  }

  /**
   * List insurance records from MongoDB
   * 
   * Filters insurance plans based on salary, family members, age, and optional custom filters.
   * Supports pagination and uses caching for improved performance.
   * 
   * @param input - Query parameters including salary, family members, age, pagination, and filters
   * @param ctx - Execution context for logging
   * @returns List of insurance plans matching the criteria
   */
  @Tool({
    name: 'list_insurance',
    description: `List insurance records from the Insurance collection in MongoDB, filtered by salary, family members, and age.

CONDITIONS AND CRITERIA:
- Salary Filter (REQUIRED): Only returns plans where premium ≤ 10% of annual salary (affordability threshold). Salary must be > 0.
- Family Members Filter (OPTIONAL): 
  * If familyMembers > 1: Returns plans with familyCoverage=true OR maxFamilyMembers >= familyMembers
  * If familyMembers = 1: Returns individual plans (familyCoverage=false) or plans that can cover at least 1 member
- Age Filter (OPTIONAL): Only returns plans where user's age falls within the plan's age range:
  * Plan matches if: (minAge doesn't exist OR user age >= minAge) AND (maxAge doesn't exist OR user age <= maxAge)
- Custom Filter (OPTIONAL): Additional MongoDB filter object for advanced queries (supports operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, $exists)
- Pagination: Default limit=100, default skip=0. Results are sorted by database order.

All filters are combined with AND logic. The tool uses caching for improved performance.`,
    inputSchema: z.object({
      salary: z.number().min(0).describe('Annual salary in currency units (required for filtering)'),
      familyMembers: z.number().min(0).optional().describe('Number of family members to cover (optional)'),
      age: z.number().min(0).max(120).optional().describe('User age in years (optional)'),
      limit: z.number().optional().describe('Maximum number of records to return (default: 100)'),
      skip: z.number().optional().describe('Number of records to skip (default: 0)'),
      filter: z.record(z.any()).optional().describe('Optional additional filter object to query specific insurance records')
    }),
    examples: {
      request: {
        salary: 500000,
        familyMembers: 4,
        age: 35,
        limit: 10,
        skip: 0
      },
      response: {
        success: true,
        count: 10,
        total: 50,
        insurance: [
          {
            name: 'Health Insurance',
            description: 'Comprehensive health coverage for individuals and families',
            policyId: 'POL-HDFC-HEA-0002'
          }
        ]
      }
    }
  })
  @Widget('insurance-list')
  async listInsurance(input: ListInsuranceInput, ctx: ExecutionContext): Promise<ListInsuranceResponse> {
    const startTime = Date.now();
    const operation = 'list_insurance';

    ctx.logger.info('Listing insurance records', {
      salary: input.salary,
      familyMembers: input.familyMembers,
      age: input.age,
      limit: input.limit,
      skip: input.skip,
      hasFilter: !!input.filter
    });

    try {
      // Validate and sanitize input
      const salary = sanitizeNumber(input.salary, 0) ?? 0;
      const familyMembers = input.familyMembers !== undefined ? sanitizeNumber(input.familyMembers, 0) ?? undefined : undefined;
      const age = input.age !== undefined ? sanitizeNumber(input.age, 0, 120) ?? undefined : undefined;
      const limit = input.limit !== undefined ? sanitizeNumber(input.limit, 1) ?? INSURANCE_CONSTANTS.DEFAULT_LIMIT : INSURANCE_CONSTANTS.DEFAULT_LIMIT;
      const skip = input.skip !== undefined ? sanitizeNumber(input.skip, 0) ?? INSURANCE_CONSTANTS.DEFAULT_SKIP : INSURANCE_CONSTANTS.DEFAULT_SKIP;

      if (salary <= 0) {
        throw new InvalidInputError('Salary must be greater than 0');
      }

      const sanitizedInput: ListInsuranceInput = {
        salary,
        familyMembers,
        age,
        limit,
        skip,
        filter: input.filter,
      };

      // Check cache
      const cacheKey = this.cacheService.getListInsuranceKey(sanitizedInput);
      const cached = this.cacheService.get<ListInsuranceResponse>(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        this.metricsService.recordSuccess(operation, duration);
        ctx.logger.info('Returned cached insurance records');
        return cached;
      }

      // Get collection
      const collection = await this.mongoService.getCollection();

      // Build query using query builder service
      const query = this.queryBuilder.buildListQuery(sanitizedInput);

      // Get total count
      const total = await collection.countDocuments(query);

      // Get records with pagination
      const insurance = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      // Convert ObjectIds to strings
      const insuranceList = convertObjectIdsToString(insurance) as InsurancePlan[];

      // Map to simplified format with name, description, and policy id
      const simplifiedInsurance: InsuranceListItem[] = insuranceList.map((plan) => {
        // Use policyNumber if available, otherwise use _id as policyId
        const policyId = plan.policyNumber || plan._id || '';

        // Get description from plan, or generate a default one
        const description = plan.description ||
          plan.category ||
          plan.type ||
          `Insurance plan with coverage up to ${plan.coverage ? plan.coverage.toLocaleString() : 'N/A'}`;

        return {
          name: plan.name || 'Unnamed Insurance Plan',
          description: description,
          policyId: policyId,
        };
      });

      const response: ListInsuranceResponse = {
        success: true,
        count: simplifiedInsurance.length,
        total,
        limit,
        skip,
        insurance: simplifiedInsurance,
      };

      // Cache the result
      this.cacheService.set(cacheKey, response);

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully retrieved insurance records', {
        count: insuranceList.length,
        total,
        duration,
        salary: sanitizedInput.salary,
        familyMembers: sanitizedInput.familyMembers,
        age: sanitizedInput.age
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to list insurance records', {
        error: error instanceof Error ? error.message : String(error),
        duration,
      });

      if (error instanceof InvalidInputError || error instanceof DatabaseQueryError) {
        throw error;
      }

      throw new DatabaseQueryError(
        'Failed to retrieve insurance records',
        {
          error: error instanceof Error ? error.message : String(error),
          input,
        }
      );
    }
  }

  /**
   * Suggest appropriate insurance plans based on user profile
   * 
   * Analyzes user profile (age, salary, family members, health deficiencies) and
   * suggests the most suitable insurance plans with match scores and reasons.
   * Uses optimized database queries instead of loading all plans.
   * 
   * @param input - User profile including age, salary, family members, and deficiencies
   * @param ctx - Execution context for logging
   * @returns Suggested insurance plans with scores and recommendations
   */
  @Tool({
    name: 'suggest_insurance_plan',
    description: `Suggest appropriate insurance plans based on user profile with match scores and reasons. Uses an intelligent scoring algorithm to rank plans.

CONDITIONS AND CRITERIA:
- Initial Filtering (Before Scoring):
  * Premium Affordability: Only considers plans where premium ≤ 10% of annual salary
  * Age Range: User's age must be within plan's age range (minAge ≤ user age ≤ maxAge, or range not specified)
  * Family Coverage: If familyMembers > 1, only plans with familyCoverage=true OR maxFamilyMembers >= familyMembers
  * Pre-existing Conditions: If deficiencies provided, prefers plans with coversPreExisting=true (but doesn't exclude unspecified plans)
  * Insurance Type: If insuranceType provided, only plans matching that type/category

- Scoring Algorithm (Match Score 0-100):
  * Age Match (weight: 30): +30 points if user age is within plan's age range
  * Premium Affordability (weight: 25): 
    - +25 points if premium ≤ 5% of salary (highly affordable)
    - +15 points if premium ≤ 10% of salary (moderate)
    - +5 points if premium > 10% of salary (may be high)
  * Family Coverage (weight: 20): +20 points if plan matches family size requirements
  * Pre-existing Conditions (weight: 25): +25 points if plan covers pre-existing conditions
  * Specific Conditions (weight: 15): +15 points if plan's coveredConditions includes any user deficiencies
  * Type Match (weight: 10): +10 points if user has deficiencies and plan type is "Health"

- Results: Returns top 5 plans (MAX_SUGGESTIONS) sorted by match score (highest first), each with matchScore and reasons array explaining why it was suggested.

The tool uses caching and optimized database queries for performance.`,
    inputSchema: z.object({
      age: z.number().min(0).max(120).describe('User age in years'),
      salary: z.number().min(0).describe('Annual salary in currency units'),
      familyMembers: z.number().min(0).describe('Number of family members to cover (including self)'),
      deficiencies: z.array(z.string()).optional().describe('List of health deficiencies or pre-existing conditions (e.g., ["diabetes", "hypertension"])'),
      insuranceType: z.string().optional().describe('Type of insurance to filter by (e.g., "Health", "Life", "Accident", "Travel", "Motor"). If provided, only plans of this type will be suggested.')
    }),
    examples: {
      request: {
        age: 35,
        salary: 500000,
        familyMembers: 4,
        deficiencies: ['diabetes', 'hypertension'],
        insuranceType: 'Health'
      },
      response: {
        success: true,
        userProfile: {
          age: 35,
          salary: 500000,
          familyMembers: 4,
          deficiencies: ['diabetes', 'hypertension'],
          insuranceType: 'Health'
        },
        suggestedPlans: [
          {
            _id: '507f1f77bcf86cd799439011',
            name: 'Family Health Insurance Premium',
            type: 'Health',
            premium: 25000,
            coverage: 500000,
            matchScore: 95,
            reasons: ['Covers family members', 'Includes pre-existing conditions', 'Affordable premium']
          }
        ],
        recommendations: 'Based on your profile, we recommend family health insurance plans that cover pre-existing conditions.'
      }
    }
  })
  @Widget('insurance-suggestion')
  async suggestInsurancePlan(input: SuggestInsurancePlanInput, ctx: ExecutionContext): Promise<SuggestInsurancePlanResponse> {
    const startTime = Date.now();
    const operation = 'suggest_insurance_plan';

    ctx.logger.info('Suggesting insurance plans', {
      age: input.age,
      salary: input.salary,
      familyMembers: input.familyMembers,
      deficiencies: input.deficiencies,
      insuranceType: input.insuranceType
    });

    try {
      // Validate and sanitize input
      const age = sanitizeNumber(input.age, 0, 120);
      const salary = sanitizeNumber(input.salary, 0);
      const familyMembers = sanitizeNumber(input.familyMembers, 0);
      const deficiencies = input.deficiencies ? sanitizeStringArray(input.deficiencies) : [];
      const insuranceType = input.insuranceType ? sanitizeString(input.insuranceType) : undefined;

      if (age === null || salary === null || familyMembers === null) {
        throw new InvalidInputError('Invalid input parameters');
      }

      const userProfile: UserProfile = {
        age,
        salary,
        familyMembers,
        deficiencies,
        insuranceType,
      };

      // Check cache
      const cacheKey = this.cacheService.getSuggestPlanKey(userProfile);
      const cached = this.cacheService.get<SuggestInsurancePlanResponse>(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        this.metricsService.recordSuccess(operation, duration);
        ctx.logger.info('Returned cached insurance suggestions');
        return cached;
      }

      // Get collection
      const collection = await this.mongoService.getCollection();

      // Build optimized query to filter plans before scoring
      const query = this.queryBuilder.buildSuggestionQuery(userProfile);

      // Get potentially suitable plans (optimized - not all plans)
      // Get more than needed to account for scoring variations
      const candidatePlans = await collection
        .find(query)
        .limit(INSURANCE_CONSTANTS.MAX_SUGGESTIONS * 3) // Get 3x to have options after scoring
        .toArray();

      // Calculate match scores for each plan
      const scoredPlans = candidatePlans.map(plan =>
        this.scoringService.calculateScore(plan, userProfile)
      );

      // Sort by match score (highest first) and take top suggestions
      const sortedPlans = scoredPlans
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, INSURANCE_CONSTANTS.MAX_SUGGESTIONS);

      // Generate recommendations
      const recommendations = this.recommendationService.generateRecommendations(userProfile);

      // Convert ObjectIds to strings
      const suggestedPlans = convertObjectIdsToString(sortedPlans) as ScoredInsurancePlan[];

      const response: SuggestInsurancePlanResponse = {
        success: true,
        userProfile,
        suggestedPlans,
        recommendations,
      };

      // Cache the result
      this.cacheService.set(cacheKey, response);

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully generated insurance suggestions', {
        candidatePlans: candidatePlans.length,
        suggestionsCount: suggestedPlans.length,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to suggest insurance plans', {
        error: error instanceof Error ? error.message : String(error),
        duration,
      });

      if (error instanceof InvalidInputError || error instanceof DatabaseQueryError) {
        throw error;
      }

      throw new DatabaseQueryError(
        'Failed to suggest insurance plans',
        {
          error: error instanceof Error ? error.message : String(error),
          input,
        }
      );
    }
  }

  /**
   * Book an insurance plan with user details
   * 
   * Creates a booking record when a user selects a policy.
   * Creates or updates user with email, name, and phone number.
   * Inserts booking with policy number from the insurance plan.
   * 
   * @param input - Booking parameters including policyNumber and user details (email, name, phoneNumber)
   * @param ctx - Execution context for logging
   * @returns Created booking details with user information
   */
  @Tool({
    name: 'book_insurance_with_user',
    description: `Book an insurance plan when user selects a policy. Creates or updates user account and creates a booking record.

IMPORTANT: Before calling this tool, you MUST ask the user for their email address if it's not already available. The email is a REQUIRED field and cannot be omitted.

CONDITIONS AND CRITERIA:
- Policy Validation:
  * policyNumber (REQUIRED): Must exist in Insurance collection. If not found, booking fails with error.
  * Premium and coverage amounts are automatically extracted from the insurance plan.

- User Account Management:
  * email (REQUIRED): Must be valid email format (validated with regex). Used as primary identifier. YOU MUST ASK THE USER FOR THEIR EMAIL if it's not provided.
  * If user exists: Updates user with new name and phoneNumber
  * If user doesn't exist: Creates new user account with provided details
  * name (REQUIRED): User's full name, minimum 1 character
  * phoneNumber (REQUIRED): User's phone number

- Booking Creation:
  * Creates booking record with status='pending' by default
  * Links booking to user via userId and to insurance plan via insurancePlanId
  * Stores policyNumber from the insurance plan

- Payment Information:
  * paymentMethod (OPTIONAL): e.g., "credit_card", "debit_card", "upi", "bank_transfer"
  * transactionId (OPTIONAL): If provided, paymentStatus is set to 'paid', otherwise 'pending'

- Coverage Dates:
  * startDate (OPTIONAL): ISO 8601 format (e.g., "2024-01-01"). Required if years is provided.
  * years (OPTIONAL): 1-50 years. If provided, startDate is REQUIRED. endDate is calculated as startDate + years - 1 day.
  * Date Validation: endDate must be after startDate. Invalid date formats are rejected.

- Additional:
  * notes (OPTIONAL): Additional comments for the booking
  * Returns isNewUser flag indicating if user was newly created

All input strings are sanitized and validated before processing.`,
    inputSchema: z.object({
      policyNumber: z.string().describe('Insurance policy number (e.g., "POL-HDFC-HEA-0002")'),
      email: z.string().email().describe('User email address (REQUIRED - you must ask the user for their email if not provided)'),
      name: z.string().min(1).describe('User full name'),
      phoneNumber: z.string().describe('User phone number'),
      paymentMethod: z.string().optional().describe('Payment method (e.g., "credit_card", "debit_card", "upi", "bank_transfer")'),
      startDate: z.string().optional().describe('Insurance coverage start date (ISO 8601 format, e.g., "2024-01-01"). Required if years is provided.'),
      years: z.number().min(1).max(50).optional().describe('Number of years for insurance coverage. If provided along with startDate, endDate will be calculated automatically.'),
      transactionId: z.string().optional().describe('Payment transaction ID if payment is already processed'),
      notes: z.string().optional().describe('Additional notes or comments for the booking')
    }),
    examples: {
      request: {
        policyNumber: 'POL-HDFC-HEA-0002',
        email: 'user@example.com',
        name: 'John Doe',
        phoneNumber: '+91-9876543210',
        paymentMethod: 'credit_card',
        startDate: '2024-01-01',
        years: 1
      },
      response: {
        success: true,
        isNewUser: true,
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+91-9876543210'
        },
        booking: {
          _id: '507f1f77bcf86cd799439013',
          userId: '507f1f77bcf86cd799439011',
          insurancePlanId: '507f1f77bcf86cd799439012',
          policyNumber: 'POL-HDFC-HEA-0002',
          status: 'pending',
          premium: 25000,
          coverageAmount: 500000
        }
      }
    }
  })
  @Widget('insurance-booking')
  async bookInsuranceWithUser(
    input: BookInsuranceWithUserInput,
    ctx: ExecutionContext
  ): Promise<BookInsuranceWithUserResponse> {
    const startTime = Date.now();
    const operation = 'book_insurance_with_user';

    ctx.logger.info('Booking insurance plan with user details', {
      policyNumber: input.policyNumber,
      email: input.email,
      name: input.name,
    });

    try {
      // Validate and sanitize input
      const policyNumber = sanitizeString(input.policyNumber);
      const email = sanitizeString(input.email)?.toLowerCase().trim();
      const name = sanitizeString(input.name);
      const phoneNumber = sanitizeString(input.phoneNumber);
      const paymentMethod = input.paymentMethod ? sanitizeString(input.paymentMethod) : undefined;
      const transactionId = input.transactionId ? sanitizeString(input.transactionId) : undefined;
      const notes = input.notes ? sanitizeString(input.notes) : undefined;

      if (!policyNumber || !email || !name || !phoneNumber) {
        throw new InvalidInputError('policyNumber, email, name, and phoneNumber are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new InvalidInputError('Invalid email format');
      }

      // Validate and parse years if provided
      const years = input.years !== undefined ? sanitizeNumber(input.years, 1, 50) : undefined;
      if (input.years !== undefined && years === null) {
        throw new InvalidInputError('Invalid years value. Must be a number between 1 and 50.');
      }

      // Parse dates if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      if (input.startDate) {
        startDate = new Date(input.startDate);
        if (isNaN(startDate.getTime())) {
          throw new InvalidInputError('Invalid startDate format. Use ISO 8601 format (e.g., "2024-01-01")');
        }
      }

      // If years is provided, startDate must also be provided
      if (years !== null && years !== undefined && !startDate) {
        throw new InvalidInputError('startDate is required when years is provided');
      }

      // Calculate endDate from years if provided
      if (years !== null && years !== undefined && startDate) {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + years);
        endDate.setDate(endDate.getDate() - 1);
      }

      // Validate date range if both dates are present
      if (startDate && endDate && startDate >= endDate) {
        throw new InvalidInputError('endDate must be after startDate');
      }

      // Get collections
      const userCollection = await this.mongoService.getUserCollection();
      const insuranceCollection = await this.mongoService.getCollection();
      const bookingCollection = await this.mongoService.getBookingCollection();

      // Verify insurance plan exists by policy number and get details
      const insurancePlan = await insuranceCollection.findOne({ policyNumber } as any);
      if (!insurancePlan) {
        throw new InvalidInputError(`Insurance plan with policy number "${policyNumber}" not found`);
      }

      // Extract premium, coverage, and insurance plan ID from insurance plan
      const premium = insurancePlan.premium || 0;
      const coverageAmount = insurancePlan.coverage || insurancePlan.coverageAmount || 0;
      const insurancePlanId = insurancePlan._id?.toString();
      if (!insurancePlanId) {
        throw new DatabaseQueryError('Insurance plan ID is missing');
      }

      // Check if user exists by email
      let user = await userCollection.findOne({ email } as any);
      let isNewUser = false;

      if (user) {
        // Update existing user with new information
        const updateData: Partial<User> = {
          name,
          phone: phoneNumber,
          updatedAt: new Date(),
        };

        await userCollection.updateOne(
          { _id: user._id },
          { $set: updateData }
        );

        // Fetch updated user
        user = await userCollection.findOne({ _id: user._id });
        if (!user) {
          throw new DatabaseQueryError('Failed to retrieve updated user');
        }
      } else {
        // Create new user
        isNewUser = true;
        const newUserData: Omit<User, '_id'> = {
          email,
          name,
          phone: phoneNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const userResult = await userCollection.insertOne(newUserData as any);
        user = await userCollection.findOne({ _id: userResult.insertedId });
        if (!user) {
          throw new DatabaseQueryError('Failed to retrieve created user');
        }
      }

      // Get user ID as string
      const userId = user._id?.toString();
      if (!userId) {
        throw new DatabaseQueryError('User ID is missing');
      }

      // Determine payment status based on transactionId
      const paymentStatus = transactionId ? 'paid' : 'pending';

      // Create booking document with policy number
      const bookingData: Omit<Booking, '_id'> = {
        userId,
        insurancePlanId, // Use the ObjectId from the found insurance plan
        policyNumber, // Use the policy number provided
        status: 'pending',
        premium,
        coverageAmount,
        paymentStatus: paymentStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        paymentMethod,
        transactionId,
        startDate,
        endDate,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert booking into database
      const result = await bookingCollection.insertOne(bookingData as any);

      // Fetch the created booking
      const createdBooking = await bookingCollection.findOne({ _id: result.insertedId });
      if (!createdBooking) {
        throw new DatabaseQueryError('Failed to retrieve created booking');
      }

      // Convert ObjectIds to strings
      const booking = convertObjectIdToString(createdBooking) as Booking;
      const userResponse = convertObjectIdToString(user) as User;

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully created insurance booking with user', {
        bookingId: booking._id,
        userId,
        insurancePlanId,
        policyNumber,
        isNewUser,
        premium,
        duration,
      });

      return {
        success: true,
        booking,
        user: userResponse,
        isNewUser,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to book insurance plan with user', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        policyNumber: input.policyNumber,
        email: input.email,
      });

      if (error instanceof InvalidInputError || error instanceof DatabaseQueryError) {
        throw error;
      }

      throw new DatabaseQueryError(
        'Failed to book insurance plan with user',
        {
          error: error instanceof Error ? error.message : String(error),
          input,
        }
      );
    }
  }

  /**
   * List booking statuses by user email
   * 
   * Retrieves all booking records for a user identified by their email address.
   * Returns all bookings with their status, premium, coverage, and other details.
   * Each booking is displayed in a separate card.
   * 
   * @param input - Query parameters including user email
   * @param ctx - Execution context for logging
   * @returns List of bookings for the user with user information
   */
  @Tool({
    name: 'list_booking_status_by_email',
    description: `List all booking statuses from the booking collection for a user identified by their email address.

CONDITIONS AND CRITERIA:
- User Validation:
  * email (REQUIRED): Must be valid email format (validated with regex)
  * User must exist in Users collection. If user not found, returns error.

- Booking Retrieval:
  * Returns ALL bookings for the user (no limit)
  * Bookings are sorted by most recent first (createdAt descending)
  * Each booking includes: _id, userId, insurancePlanId, policyNumber, status, premium, coverageAmount, paymentStatus, paymentMethod, transactionId, startDate, endDate, notes, createdAt, updatedAt

- Response Format:
  * Returns user information
  * Returns array of all bookings with full details
  * Returns count of total bookings
  * Each booking is displayed in a separate card in the widget

- Booking Status Values:
  * status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'active'
  * paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'

The tool provides a complete booking history for the user.`,
    inputSchema: z.object({
      email: z.string().email().describe('User email address to retrieve bookings for')
    }),
    examples: {
      request: {
        email: 'user@example.com'
      },
      response: {
        success: true,
        user: {
          _id: '507f1f77bcf86cd799439011',
          email: 'user@example.com',
          name: 'John Doe',
          phone: '+91-9876543210'
        },
        bookings: [
          {
            _id: '507f1f77bcf86cd799439013',
            userId: '507f1f77bcf86cd799439011',
            insurancePlanId: '507f1f77bcf86cd799439012',
            policyNumber: 'POL-HDFC-HEA-0002',
            status: 'confirmed',
            premium: 25000,
            coverageAmount: 500000,
            paymentStatus: 'paid',
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          }
        ],
        count: 1
      }
    }
  })
  @Widget('booking-status-list')
  async listBookingStatusByEmail(
    input: ListBookingStatusByEmailInput,
    ctx: ExecutionContext
  ): Promise<ListBookingStatusByEmailResponse> {
    const startTime = Date.now();
    const operation = 'list_booking_status_by_email';

    ctx.logger.info('Listing booking statuses by email', {
      email: input.email,
    });

    try {
      // Validate and sanitize input
      const email = sanitizeString(input.email)?.toLowerCase().trim();

      if (!email) {
        throw new InvalidInputError('Email is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new InvalidInputError('Invalid email format');
      }

      // Get collections
      const userCollection = await this.mongoService.getUserCollection();
      const bookingCollection = await this.mongoService.getBookingCollection();

      // Find user by email
      const user = await userCollection.findOne({ email } as any);
      if (!user) {
        throw new InvalidInputError(`User with email "${email}" not found`);
      }

      // Get user ID as string
      const userId = user._id?.toString();
      if (!userId) {
        throw new DatabaseQueryError('User ID is missing');
      }

      // Find all bookings for this user
      const bookings = await bookingCollection
        .find({ userId } as any)
        .sort({ createdAt: -1 }) // Sort by most recent first
        .toArray();

      // Convert ObjectIds to strings
      const bookingsList = convertObjectIdsToString(bookings) as Booking[];
      const userResponse = convertObjectIdToString(user) as User;

      const response: ListBookingStatusByEmailResponse = {
        success: true,
        user: userResponse,
        bookings: bookingsList,
        count: bookingsList.length,
      };

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully retrieved booking statuses by email', {
        email,
        userId,
        bookingCount: bookingsList.length,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to list booking statuses by email', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        email: input.email,
      });

      if (error instanceof InvalidInputError || error instanceof DatabaseQueryError) {
        throw error;
      }

      throw new DatabaseQueryError(
        'Failed to retrieve booking statuses by email',
        {
          error: error instanceof Error ? error.message : String(error),
          input,
        }
      );
    }
  }

}
