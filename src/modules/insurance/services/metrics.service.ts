/**
 * Metrics and monitoring service for insurance operations
 */

interface MetricEntry {
  count: number;
  totalTime: number;
  minTime: number;
  maxTime: number;
  errors: number;
  lastUpdated: number;
}

/**
 * Service for collecting metrics and monitoring
 */
export class MetricsService {
  private static instance: MetricsService;
  private metrics: Map<string, MetricEntry>;

  private constructor() {
    this.metrics = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Record a successful operation
   */
  public recordSuccess(operation: string, duration: number): void {
    const entry = this.getOrCreateEntry(operation);
    entry.count++;
    entry.totalTime += duration;
    entry.minTime = Math.min(entry.minTime, duration);
    entry.maxTime = Math.max(entry.maxTime, duration);
    entry.lastUpdated = Date.now();
  }

  /**
   * Record a failed operation
   */
  public recordError(operation: string, duration: number): void {
    const entry = this.getOrCreateEntry(operation);
    entry.errors++;
    entry.totalTime += duration;
    entry.lastUpdated = Date.now();
  }

  /**
   * Get or create metric entry
   */
  private getOrCreateEntry(operation: string): MetricEntry {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
        lastUpdated: Date.now(),
      });
    }
    return this.metrics.get(operation)!;
  }

  /**
   * Get metrics for an operation
   */
  public getMetrics(operation: string): {
    count: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    errors: number;
    successRate: number;
  } | null {
    const entry = this.metrics.get(operation);
    if (!entry || entry.count === 0) {
      return null;
    }

    return {
      count: entry.count,
      avgTime: entry.totalTime / entry.count,
      minTime: entry.minTime === Infinity ? 0 : entry.minTime,
      maxTime: entry.maxTime,
      errors: entry.errors,
      successRate: ((entry.count - entry.errors) / entry.count) * 100,
    };
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): Record<string, ReturnType<typeof this.getMetrics>> {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {};
    for (const operation of this.metrics.keys()) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.metrics.clear();
  }

  /**
   * Reset metrics for a specific operation
   */
  public resetOperation(operation: string): void {
    this.metrics.delete(operation);
  }
}
