/**
 * Health check for Insurance module
 */

import { HealthCheck, HealthCheckInterface, HealthCheckResult } from '@nitrostack/core';
import { MongoDBService } from '../services/mongodb.service.js';

/**
 * Insurance module health check
 * Monitors MongoDB connection health
 */
@HealthCheck({
  name: 'insurance',
  description: 'Insurance module and MongoDB connection health check',
  interval: 30 // Check every 30 seconds
})
export class InsuranceHealthCheck implements HealthCheckInterface {
  private mongoService: MongoDBService;

  constructor() {
    this.mongoService = MongoDBService.getInstance();
  }

  async check(): Promise<HealthCheckResult> {
    try {
      const dbHealth = await this.mongoService.healthCheck();

      if (dbHealth.status === 'down') {
        return {
          status: 'down',
          message: 'Insurance module is unhealthy - MongoDB connection failed',
          details: {
            database: dbHealth.message,
          },
        };
      }

      return {
        status: 'up',
        message: 'Insurance module is healthy',
        details: {
          database: dbHealth.message,
        },
      };
    } catch (error: any) {
      return {
        status: 'down',
        message: 'Insurance module health check failed',
        details: {
          error: error?.message || String(error),
        },
      };
    }
  }
}
