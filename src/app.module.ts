import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { InsuranceModule } from './modules/insurance/insurance.module.js';
import { SystemHealthCheck } from './health/system.health.js';
// Load environment variables
import 'dotenv/config';

/**
 * Root Application Module
 * 
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'insurance-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    InsuranceModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule { }

