/**
 * Insurance module configuration
 */

import { z } from 'zod';
import { ConfigurationError } from '../errors/insurance.errors.js';
import { DatabaseConfig, ScoringWeights } from '../interfaces/insurance.interfaces.js';

/**
 * Environment variables schema
 */
const ConfigSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_DATABASE_NAME: z.string().min(1, 'MongoDB database name is required').default('Insurance'),
  MONGODB_COLLECTION_NAME: z.string().min(1, 'MongoDB collection name is required').default('Insurance'),
  MONGODB_MAX_POOL_SIZE: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('10'),
  MONGODB_MIN_POOL_SIZE: z.string().transform(Number).pipe(z.number().int().nonnegative()).optional().default('2'),
  MONGODB_CONNECT_TIMEOUT_MS: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('30000'),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('5000'),
});

/**
 * Insurance configuration service
 */
export class InsuranceConfig {
  private static instance: InsuranceConfig;
  private config: z.infer<typeof ConfigSchema>;
  private databaseConfig: DatabaseConfig;
  private scoringWeights: ScoringWeights;

  private constructor() {
    try {
      // Load and validate environment variables
      this.config = ConfigSchema.parse({
        MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/',
        MONGODB_DATABASE_NAME: process.env.MONGODB_DATABASE_NAME || 'Insurance',
        MONGODB_COLLECTION_NAME: process.env.MONGODB_COLLECTION_NAME || 'Insurance',
        MONGODB_MAX_POOL_SIZE: process.env.MONGODB_MAX_POOL_SIZE || '10',
        MONGODB_MIN_POOL_SIZE: process.env.MONGODB_MIN_POOL_SIZE || '2',
        MONGODB_CONNECT_TIMEOUT_MS: process.env.MONGODB_CONNECT_TIMEOUT_MS || '30000',
        MONGODB_SERVER_SELECTION_TIMEOUT_MS: process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000',
      });

      // Build database configuration
      this.databaseConfig = {
        uri: this.config.MONGODB_URI,
        databaseName: this.config.MONGODB_DATABASE_NAME,
        collectionName: this.config.MONGODB_COLLECTION_NAME,
        maxPoolSize: this.config.MONGODB_MAX_POOL_SIZE,
        minPoolSize: this.config.MONGODB_MIN_POOL_SIZE,
        connectTimeoutMS: this.config.MONGODB_CONNECT_TIMEOUT_MS,
        serverSelectionTimeoutMS: this.config.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      };

      // Default scoring weights (can be overridden via environment variables)
      this.scoringWeights = {
        age: 30,
        premium: 25,
        familyCoverage: 20,
        preExistingConditions: 25,
        specificConditions: 15,
        typeMatch: 10,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConfigurationError(
          'Invalid configuration',
          { errors: error.errors }
        );
      }
      throw error;
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): InsuranceConfig {
    if (!InsuranceConfig.instance) {
      InsuranceConfig.instance = new InsuranceConfig();
    }
    return InsuranceConfig.instance;
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig(): DatabaseConfig {
    return { ...this.databaseConfig };
  }

  /**
   * Get scoring weights
   */
  public getScoringWeights(): ScoringWeights {
    return { ...this.scoringWeights };
  }

  /**
   * Get MongoDB URI
   */
  public getMongoUri(): string {
    return this.databaseConfig.uri;
  }

  /**
   * Get database name
   */
  public getDatabaseName(): string {
    return this.databaseConfig.databaseName;
  }

  /**
   * Get collection name
   */
  public getCollectionName(): string {
    return this.databaseConfig.collectionName;
  }
}

/**
 * Constants for insurance calculations
 */
export const INSURANCE_CONSTANTS = {
  /** Premium should be less than 10% of salary for affordability */
  MAX_AFFORDABLE_PREMIUM_RATIO: 0.10,
  /** Premium less than 5% of salary is highly affordable */
  HIGHLY_AFFORDABLE_PREMIUM_RATIO: 0.05,
  /** Default limit for queries */
  DEFAULT_LIMIT: 100,
  /** Default skip for pagination */
  DEFAULT_SKIP: 0,
  /** Default limit for name search */
  DEFAULT_SEARCH_LIMIT: 50,
  /** Maximum number of suggestions to return */
  MAX_SUGGESTIONS: 5,
  /** Maximum match score */
  MAX_MATCH_SCORE: 100,
  /** Minimum match score */
  MIN_MATCH_SCORE: 0,
} as const;
