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
  SearchInsuranceNamesInput,
  SearchInsuranceNamesResponse,
  SuggestInsurancePlanInput,
  SuggestInsurancePlanResponse,
  BookInsuranceInput,
  BookInsuranceResponse,
  UserProfile,
  InsurancePlan,
  ScoredInsurancePlan,
  Booking,
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
    description: 'List insurance records from the Insurance collection in MongoDB, filtered by salary, family members, and age',
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
            _id: '507f1f77bcf86cd799439011',
            name: 'Health Insurance',
            type: 'Health',
            premium: 5000
          }
        ]
      }
    }
  })
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

      const response: ListInsuranceResponse = {
        success: true,
        count: insuranceList.length,
        total,
        limit,
        skip,
        insurance: insuranceList,
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
   * Search insurance names with auto-complete support
   * 
   * Searches for insurance plan names matching the query string.
   * Returns unique names for use in dropdown/autocomplete widgets.
   * 
   * @param input - Search parameters including query string and limit
   * @param ctx - Execution context for logging
   * @returns List of unique insurance names matching the search
   */
  @Tool({
    name: 'search_insurance_names',
    description: 'Search and list insurance names with auto-complete support. Returns unique insurance names matching the search query.',
    inputSchema: z.object({
      searchQuery: z.string().optional().describe('Search query to filter insurance names (case-insensitive partial match)'),
      limit: z.number().optional().describe('Maximum number of names to return (default: 50)')
    }),
    examples: {
      request: {
        searchQuery: 'health',
        limit: 20
      },
      response: {
        success: true,
        count: 5,
        insuranceNames: [
          { name: 'Health Insurance Premium', id: '507f1f77bcf86cd799439011' },
          { name: 'Health Plus Plan', id: '507f1f77bcf86cd799439012' },
          { name: 'Family Health Insurance', id: '507f1f77bcf86cd799439013' }
        ]
      }
    }
  })
  @Widget('insurance-search-dropdown')
  async searchInsuranceNames(input: SearchInsuranceNamesInput, ctx: ExecutionContext): Promise<SearchInsuranceNamesResponse> {
    const startTime = Date.now();
    const operation = 'search_insurance_names';

    ctx.logger.info('Searching insurance names', {
      searchQuery: input.searchQuery,
      limit: input.limit
    });

    try {
      // Sanitize input
      const sanitizedQuery = input.searchQuery ? sanitizeRegex(input.searchQuery) : undefined;
      const limit = input.limit !== undefined
        ? sanitizeNumber(input.limit, 1) ?? INSURANCE_CONSTANTS.DEFAULT_SEARCH_LIMIT
        : INSURANCE_CONSTANTS.DEFAULT_SEARCH_LIMIT;

      // Check cache
      const cacheKey = this.cacheService.getSearchNamesKey({ searchQuery: sanitizedQuery, limit });
      const cached = this.cacheService.get<SearchInsuranceNamesResponse>(cacheKey);
      if (cached) {
        const duration = Date.now() - startTime;
        this.metricsService.recordSuccess(operation, duration);
        ctx.logger.info('Returned cached insurance names');
        return cached;
      }

      // Get collection
      const collection = await this.mongoService.getCollection();

      // Build query using query builder service
      const query = this.queryBuilder.buildSearchQuery(sanitizedQuery);

      // Get insurance records matching the search
      const insurance = await collection
        .find(query)
        .limit(limit * 2) // Get more to account for duplicates
        .project({ name: 1, _id: 1 }) // Only get name and _id for efficiency
        .toArray();

      // Extract unique names (case-insensitive)
      const nameMap = new Map<string, { name: string; id: string }>();
      for (const item of insurance) {
        const name = item.name || 'Unnamed Insurance';
        const lowerName = name.toLowerCase();
        if (!nameMap.has(lowerName)) {
          nameMap.set(lowerName, {
            name,
            id: item._id.toString()
          });
        }
      }

      const uniqueNames = Array.from(nameMap.values()).slice(0, limit);

      const response: SearchInsuranceNamesResponse = {
        success: true,
        count: uniqueNames.length,
        searchQuery: sanitizedQuery || '',
        insuranceNames: uniqueNames,
      };

      // Cache the result (shorter TTL for search results)
      this.cacheService.set(cacheKey, response, 2 * 60 * 1000); // 2 minutes

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully retrieved insurance names', {
        count: uniqueNames.length,
        searchQuery: sanitizedQuery,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to search insurance names', {
        error: error instanceof Error ? error.message : String(error),
        duration,
      });

      throw new DatabaseQueryError(
        'Failed to search insurance names',
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
    description: 'Suggest appropriate insurance plans based on user profile: age, salary, family members, and health deficiencies',
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
   * Book an insurance plan after receiving suggestions
   * 
   * Creates a booking record for a user and insurance plan.
   * Validates that both the user and insurance plan exist before creating the booking.
   * 
   * @param input - Booking parameters including userId, insurancePlanId, and optional fields
   * @param ctx - Execution context for logging
   * @returns Created booking details
   */
  @Tool({
    name: 'book_insurance',
    description: 'Book an insurance plan after receiving suggestions. Creates a booking record for a user and insurance plan with optional payment and date information. End date is calculated automatically from start date and number of years.',
    inputSchema: z.object({
      userId: z.string().describe('User ID (from Users collection)'),
      schemeId: z.string().describe('Insurance scheme ID (from suggested plans)'),
      paymentMethod: z.string().optional().describe('Payment method (e.g., "credit_card", "debit_card", "upi", "bank_transfer")'),
      startDate: z.string().optional().describe('Insurance coverage start date (ISO 8601 format, e.g., "2024-01-01"). Required if years is provided.'),
      years: z.number().min(1).max(50).optional().describe('Number of years for insurance coverage. If provided along with startDate, endDate will be calculated automatically.'),
      transactionId: z.string().optional().describe('Payment transaction ID if payment is already processed'),
      notes: z.string().optional().describe('Additional notes or comments for the booking')
    }),
    examples: {
      request: {
        userId: '507f1f77bcf86cd799439011',
        schemeId: '507f1f77bcf86cd799439012',
        paymentMethod: 'credit_card',
        startDate: '2024-01-01',
        years: 1,
        notes: 'Booking after receiving suggestions'
      },
      response: {
        success: true,
        booking: {
          _id: '507f1f77bcf86cd799439013',
          userId: '507f1f77bcf86cd799439011',
          insurancePlanId: '507f1f77bcf86cd799439012',
          status: 'pending',
          premium: 25000,
          coverageAmount: 500000,
          paymentMethod: 'credit_card',
          paymentStatus: 'pending',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          notes: 'Booking after receiving suggestions',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  async bookInsurance(
    input: BookInsuranceInput,
    ctx: ExecutionContext
  ): Promise<BookInsuranceResponse> {
    const startTime = Date.now();
    const operation = 'book_insurance';

    ctx.logger.info('Booking insurance plan', {
      userId: input.userId,
      schemeId: input.schemeId,
      paymentMethod: input.paymentMethod,
    });

    try {
      // Validate and sanitize input
      const userId = sanitizeString(input.userId);
      const schemeId = sanitizeString(input.schemeId);
      const paymentMethod = input.paymentMethod ? sanitizeString(input.paymentMethod) : undefined;
      const transactionId = input.transactionId ? sanitizeString(input.transactionId) : undefined;
      const notes = input.notes ? sanitizeString(input.notes) : undefined;

      // Use schemeId as insurancePlanId
      const insurancePlanId = schemeId;

      if (!userId || !schemeId) {
        throw new InvalidInputError('userId and schemeId are required');
      }

      // Validate ObjectId format
      if (!ObjectId.isValid(userId)) {
        throw new InvalidInputError(
          `Invalid userId format. Expected a 24-character hexadecimal MongoDB ObjectId string. Received: "${userId}". ` +
          `Example format: "507f1f77bcf86cd799439011"`
        );
      }
      if (!ObjectId.isValid(schemeId)) {
        throw new InvalidInputError(
          `Invalid schemeId format. Expected a 24-character hexadecimal MongoDB ObjectId string. Received: "${schemeId}". ` +
          `Example format: "507f1f77bcf86cd799439012". ` +
          `You can get valid IDs from the suggest_insurance_plan tool response (suggestedPlans[]._id) or use the list_insurance tool.`
        );
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
        // Calculate end date by adding years to start date
        // This gives exactly 'years' years of coverage (e.g., if start is 2024-01-01 and years is 1, end is 2025-01-01)
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + years);
        // Subtract one day to make it the last day of coverage (e.g., 2024-01-01 + 1 year = 2025-01-01, then subtract 1 day = 2024-12-31)
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

      // Verify user exists
      const user = await userCollection.findOne({ _id: new ObjectId(userId) } as any);
      if (!user) {
        throw new InvalidInputError(`User with ID ${userId} not found`);
      }

      // Verify insurance plan exists and get details
      const insurancePlan = await insuranceCollection.findOne({ _id: new ObjectId(insurancePlanId) } as any);
      if (!insurancePlan) {
        throw new InvalidInputError(`Insurance plan with ID ${insurancePlanId} not found`);
      }

      // Extract premium and coverage from insurance plan
      const premium = insurancePlan.premium || 0;
      const coverageAmount = insurancePlan.coverage || insurancePlan.coverageAmount || 0;

      // Determine payment status based on transactionId
      const paymentStatus = transactionId ? 'paid' : 'pending';

      // Create booking document
      const bookingData: Omit<Booking, '_id'> = {
        userId,
        insurancePlanId,
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

      // Convert ObjectId to string
      const booking = convertObjectIdToString(createdBooking) as Booking;

      const duration = Date.now() - startTime;
      this.metricsService.recordSuccess(operation, duration);

      ctx.logger.info('Successfully created insurance booking', {
        bookingId: booking._id,
        userId,
        insurancePlanId,
        premium,
        duration,
      });

      return {
        success: true,
        booking,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsService.recordError(operation, duration);

      ctx.logger.error('Failed to book insurance plan', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        userId: input.userId,
        schemeId: input.schemeId,
      });

      if (error instanceof InvalidInputError || error instanceof DatabaseQueryError) {
        throw error;
      }

      throw new DatabaseQueryError(
        'Failed to book insurance plan',
        {
          error: error instanceof Error ? error.message : String(error),
          input,
        }
      );
    }
  }
}
