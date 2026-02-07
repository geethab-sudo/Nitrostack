import { Module } from '@nitrostack/core';
import { InsuranceTools } from './insurance.tools.js';
import { InsuranceResources } from './insurance.resources.js';
import { InsurancePrompts } from './insurance.prompts.js';
import { MongoDBInitProvider } from './providers/mongodb-init.provider.js';
import { InsuranceHealthCheck } from './health/insurance.health.js';

/**
 * Insurance Module
 * 
 * Provides insurance data management functionality including:
 * - Listing and searching insurance plans
 * - Suggesting insurance plans based on user profile
 * - MongoDB integration with connection management
 * - Caching and metrics
 */
@Module({
  name: 'insurance',
  description: 'Insurance data management module',
  controllers: [InsuranceTools, InsuranceResources, InsurancePrompts],
  providers: [
    MongoDBInitProvider,
    InsuranceHealthCheck,
  ]
})
export class InsuranceModule { }
