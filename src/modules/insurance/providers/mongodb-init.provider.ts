/**
 * MongoDB initialization provider
 * Initializes MongoDB connection when module loads
 */

import { MongoDBService } from '../services/mongodb.service.js';

/**
 * Provider to initialize MongoDB connection
 * This will be called when the module is loaded
 */
export class MongoDBInitProvider {
  private mongoService: MongoDBService;

  constructor() {
    this.mongoService = MongoDBService.getInstance();
    // Initialize connection asynchronously
    this.initialize();
  }

  /**
   * Initialize MongoDB connection
   */
  private async initialize(): Promise<void> {
    try {
      await this.mongoService.initialize();
      console.log('MongoDB connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB connection:', error);
      // Don't throw - allow app to start and retry on first use
    }
  }

  /**
   * Get MongoDB service instance
   */
  public getMongoService(): MongoDBService {
    return this.mongoService;
  }
}
