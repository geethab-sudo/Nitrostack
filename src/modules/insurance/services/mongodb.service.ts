/**
 * MongoDB service with connection management and lifecycle hooks
 */

import { MongoClient, Db, Collection, MongoClientOptions } from 'mongodb';
import { InsuranceConfig } from '../config/insurance.config.js';
import { DatabaseConnectionError, DatabaseQueryError } from '../errors/insurance.errors.js';
import { InsurancePlan, User, Booking } from '../interfaces/insurance.interfaces.js';

/**
 * MongoDB service for managing database connections
 */
export class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<InsurancePlan> | null = null;
  private userCollection: Collection<User> | null = null;
  private bookingCollection: Collection<Booking> | null = null;
  private config: ReturnType<typeof InsuranceConfig.getInstance>;
  private connectionPromise: Promise<MongoClient> | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // 1 second

  private constructor() {
    this.config = InsuranceConfig.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  /**
   * Initialize MongoDB connection
   * Should be called on module initialization
   */
  public async initialize(): Promise<void> {
    if (this.client && this.isConnected()) {
      return;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise.then(() => undefined);
    }

    this.isConnecting = true;
    this.connectionPromise = this.connectWithRetry();

    try {
      await this.connectionPromise;
      await this.ensureIndexes();
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      throw error;
    }

    this.isConnecting = false;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  private async connectWithRetry(attempt: number = 0): Promise<MongoClient> {
    const dbConfig = this.config.getDatabaseConfig();

    const options: MongoClientOptions = {
      maxPoolSize: dbConfig.maxPoolSize,
      minPoolSize: dbConfig.minPoolSize,
      connectTimeoutMS: dbConfig.connectTimeoutMS,
      serverSelectionTimeoutMS: dbConfig.serverSelectionTimeoutMS,
      retryWrites: true,
      retryReads: true,
    };

    try {
      const client = new MongoClient(dbConfig.uri, options);
      await client.connect();

      // Verify connection
      await client.db('admin').command({ ping: 1 });

      this.client = client;
      this.db = client.db(dbConfig.databaseName);
      this.collection = this.db.collection<InsurancePlan>(dbConfig.collectionName);
      this.userCollection = this.db.collection<User>('Users');
      this.bookingCollection = this.db.collection<Booking>('Bookings');
      this.reconnectAttempts = 0;

      return client;
    } catch (error) {
      if (attempt < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connectWithRetry(attempt + 1);
      }

      throw new DatabaseConnectionError(
        `Failed to connect to MongoDB after ${attempt + 1} attempts`,
        {
          uri: dbConfig.uri,
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Check if client is connected
   */
  public isConnected(): boolean {
    return this.client !== null;
  }

  /**
   * Get MongoDB client
   */
  public async getClient(): Promise<MongoClient> {
    if (!this.client || !this.isConnected()) {
      await this.initialize();
    }
    if (!this.client) {
      throw new DatabaseConnectionError('MongoDB client not initialized');
    }
    return this.client;
  }

  /**
   * Get database instance
   */
  public async getDatabase(): Promise<Db> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new DatabaseConnectionError('Database not initialized');
    }
    return this.db;
  }

  /**
   * Get collection instance
   */
  public async getCollection(): Promise<Collection<InsurancePlan>> {
    if (!this.collection) {
      await this.initialize();
    }
    if (!this.collection) {
      throw new DatabaseConnectionError('Collection not initialized');
    }
    return this.collection;
  }

  /**
   * Get user collection instance
   */
  public async getUserCollection(): Promise<Collection<User>> {
    if (!this.userCollection) {
      await this.initialize();
    }
    if (!this.userCollection) {
      throw new DatabaseConnectionError('User collection not initialized');
    }
    return this.userCollection;
  }

  /**
   * Get booking collection instance
   */
  public async getBookingCollection(): Promise<Collection<Booking>> {
    if (!this.bookingCollection) {
      await this.initialize();
    }
    if (!this.bookingCollection) {
      throw new DatabaseConnectionError('Booking collection not initialized');
    }
    return this.bookingCollection;
  }

  /**
   * Ensure database indexes exist for optimal query performance
   */
  private async ensureIndexes(): Promise<void> {
    try {
      const collection = await this.getCollection();
      const userCollection = await this.getUserCollection();
      const bookingCollection = await this.getBookingCollection();

      // Create indexes for insurance plans
      await Promise.all([
        // Index for name search (text search)
        collection.createIndex({ name: 'text' }, { background: true }),
        // Index for premium filtering
        collection.createIndex({ premium: 1 }, { background: true }),
        // Index for age range filtering
        collection.createIndex({ minAge: 1, maxAge: 1 }, { background: true }),
        // Index for family coverage
        collection.createIndex({ familyCoverage: 1, maxFamilyMembers: 1 }, { background: true }),
        // Index for pre-existing conditions
        collection.createIndex({ coversPreExisting: 1 }, { background: true }),
        // Index for policy number (unique constraint - ensures no duplicate policy numbers)
        collection.createIndex({ policyNumber: 1 }, { background: true, unique: true, sparse: true }),
        // Compound index for common queries
        collection.createIndex(
          { premium: 1, familyCoverage: 1, minAge: 1, maxAge: 1 },
          { background: true }
        ),
      ]);

      // Create indexes for users
      await Promise.all([
        // Index for email (unique and required)
        userCollection.createIndex({ email: 1 }, { background: true, unique: true }),
        // Index for name search
        userCollection.createIndex({ name: 'text' }, { background: true }),
        // Index for age filtering
        userCollection.createIndex({ age: 1 }, { background: true }),
        // Index for salary filtering
        userCollection.createIndex({ salary: 1 }, { background: true }),
        // Index for designation search
        userCollection.createIndex({ designation: 1 }, { background: true }),
        // Index for phone (unique if provided)
        userCollection.createIndex({ phone: 1 }, { background: true, sparse: true }),
        // Index for createdAt for sorting
        userCollection.createIndex({ createdAt: -1 }, { background: true }),
      ]);

      // Create indexes for bookings
      await Promise.all([
        // Index for userId (most common query)
        bookingCollection.createIndex({ userId: 1 }, { background: true }),
        // Index for insurancePlanId
        bookingCollection.createIndex({ insurancePlanId: 1 }, { background: true }),
        // Index for status filtering
        bookingCollection.createIndex({ status: 1 }, { background: true }),
        // Index for payment status
        bookingCollection.createIndex({ paymentStatus: 1 }, { background: true }),
        // Compound index for user bookings by status
        bookingCollection.createIndex({ userId: 1, status: 1 }, { background: true }),
        // Compound index for date range queries
        bookingCollection.createIndex({ startDate: 1, endDate: 1 }, { background: true }),
        // Index for createdAt for sorting
        bookingCollection.createIndex({ createdAt: -1 }, { background: true }),
        // Index for transactionId (unique if provided)
        bookingCollection.createIndex({ transactionId: 1 }, { background: true, sparse: true }),
      ]);
    } catch (error) {
      // Log but don't fail - indexes are optimizations
      console.warn('Failed to create indexes:', error);
    }
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<{ status: 'up' | 'down'; message: string }> {
    try {
      if (!this.isConnected()) {
        return { status: 'down', message: 'Not connected to database' };
      }

      const client = await this.getClient();
      await client.db('admin').command({ ping: 1 });

      return { status: 'up', message: 'Database connection is healthy' };
    } catch (error) {
      return {
        status: 'down',
        message: `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Close database connection
   * Should be called on module destruction
   */
  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } catch (error) {
        // Log but don't throw - cleanup should be best effort
        console.warn('Error closing MongoDB connection:', error);
      } finally {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.userCollection = null;
        this.bookingCollection = null;
        this.connectionPromise = null;
        this.isConnecting = false;
      }
    }
  }
}
