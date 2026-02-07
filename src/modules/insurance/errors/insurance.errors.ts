/**
 * Custom error classes for Insurance module
 */

/**
 * Base error class for Insurance module
 */
export class InsuranceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends InsuranceError {
  constructor(message: string = 'Failed to connect to database', context?: Record<string, any>) {
    super(message, 'DB_CONNECTION_ERROR', 503, context);
  }
}

/**
 * Database query error
 */
export class DatabaseQueryError extends InsuranceError {
  constructor(message: string = 'Database query failed', context?: Record<string, any>) {
    super(message, 'DB_QUERY_ERROR', 500, context);
  }
}

/**
 * Invalid input error
 */
export class InvalidInputError extends InsuranceError {
  constructor(message: string = 'Invalid input provided', context?: Record<string, any>) {
    super(message, 'INVALID_INPUT', 400, context);
  }
}

/**
 * Insurance not found error
 */
export class InsuranceNotFoundError extends InsuranceError {
  constructor(message: string = 'Insurance plan not found', context?: Record<string, any>) {
    super(message, 'INSURANCE_NOT_FOUND', 404, context);
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends InsuranceError {
  constructor(message: string = 'Configuration error', context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', 500, context);
  }
}
