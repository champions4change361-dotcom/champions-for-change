import { randomUUID } from "crypto";

// =============================================================================
// QUERY PERFORMANCE MONITORING SYSTEM
// Tracks slow queries, database health, and performance metrics
// =============================================================================

export interface QueryMetric {
  id: string;
  query: string;
  method: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  userId?: string;
  clientInfo?: {
    userAgent?: string;
    ip?: string;
  };
}

export interface PerformanceStats {
  totalQueries: number;
  slowQueries: number;
  averageResponseTime: number;
  errorRate: number;
  queriesPerMinute: number;
  topSlowQueries: QueryMetric[];
  healthStatus: 'healthy' | 'degraded' | 'critical';
  lastUpdated: number;
}

export interface DatabaseHealth {
  connectionStatus: 'connected' | 'disconnected' | 'error';
  responseTime: number;
  activeConnections?: number;
  queryBacklog?: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  errorCount: number;
  lastError?: string;
  uptime: number;
}

export class QueryPerformanceMonitor {
  private metrics: QueryMetric[] = [];
  private readonly maxMetrics: number;
  private readonly slowQueryThreshold: number;
  private startTime: number;
  private healthChecks: DatabaseHealth[] = [];

  constructor(maxMetrics: number = 1000, slowQueryThreshold: number = 1000) {
    this.maxMetrics = maxMetrics;
    this.slowQueryThreshold = slowQueryThreshold; // ms
    this.startTime = Date.now();
    
    // Clean up old metrics every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Record a query execution
  recordQuery(
    query: string, 
    method: string, 
    duration: number, 
    success: boolean = true, 
    error?: string,
    userId?: string,
    clientInfo?: any
  ): void {
    const metric: QueryMetric = {
      id: randomUUID(),
      query: this.sanitizeQuery(query),
      method,
      duration,
      timestamp: Date.now(),
      success,
      error,
      userId,
      clientInfo
    };

    this.metrics.push(metric);

    // Log slow queries immediately
    if (duration > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected (${duration}ms): ${method} - ${this.sanitizeQuery(query)}`);
    }

    // Log errors immediately
    if (!success && error) {
      console.error(`❌ Query error: ${method} - ${error}`);
    }

    // Trim metrics if we exceed max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Record database health check
  recordHealthCheck(health: Omit<DatabaseHealth, 'uptime'>): void {
    const healthWithUptime: DatabaseHealth = {
      ...health,
      uptime: Date.now() - this.startTime
    };
    
    this.healthChecks.push(healthWithUptime);
    
    // Keep only last 100 health checks
    if (this.healthChecks.length > 100) {
      this.healthChecks = this.healthChecks.slice(-100);
    }

    // Log critical health issues
    if (health.connectionStatus === 'error' || health.responseTime > 5000) {
      console.error(`🚨 Database health critical: ${health.connectionStatus}, response time: ${health.responseTime}ms`);
    }
  }

  // Get performance statistics
  getPerformanceStats(timeWindowMs: number = 5 * 60 * 1000): PerformanceStats {
    const now = Date.now();
    const windowStart = now - timeWindowMs;
    
    // Filter metrics within time window
    const recentMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    const totalQueries = recentMetrics.length;
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const errorQueries = recentMetrics.filter(m => !m.success).length;
    
    const averageResponseTime = totalQueries > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries 
      : 0;
    
    const errorRate = totalQueries > 0 ? errorQueries / totalQueries : 0;
    const queriesPerMinute = (totalQueries / (timeWindowMs / 60000));
    
    // Get top 10 slowest queries
    const topSlowQueries = recentMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Determine health status
    let healthStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorRate > 0.1 || averageResponseTime > 2000) {
      healthStatus = 'critical';
    } else if (errorRate > 0.05 || averageResponseTime > 1000 || slowQueries > totalQueries * 0.1) {
      healthStatus = 'degraded';
    }

    return {
      totalQueries,
      slowQueries,
      averageResponseTime,
      errorRate,
      queriesPerMinute,
      topSlowQueries,
      healthStatus,
      lastUpdated: now
    };
  }

  // Get database health
  getDatabaseHealth(): DatabaseHealth | null {
    return this.healthChecks.length > 0 ? this.healthChecks[this.healthChecks.length - 1] : null;
  }

  // Get recent health history
  getHealthHistory(count: number = 10): DatabaseHealth[] {
    return this.healthChecks.slice(-count);
  }

  // Get metrics for analysis
  getMetrics(limit: number = 100): QueryMetric[] {
    return this.metrics.slice(-limit);
  }

  // Get slow queries
  getSlowQueries(limit: number = 50): QueryMetric[] {
    return this.metrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get error queries
  getErrorQueries(limit: number = 50): QueryMetric[] {
    return this.metrics
      .filter(m => !m.success)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Export metrics for external analysis
  exportMetrics(): {
    metrics: QueryMetric[];
    healthChecks: DatabaseHealth[];
    stats: PerformanceStats;
  } {
    return {
      metrics: this.metrics,
      healthChecks: this.healthChecks,
      stats: this.getPerformanceStats()
    };
  }

  // Clear all metrics
  reset(): void {
    this.metrics = [];
    this.healthChecks = [];
    this.startTime = Date.now();
  }

  // Clean up old metrics (keep last hour)
  private cleanup(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const initialCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(m => m.timestamp >= oneHourAgo);
    this.healthChecks = this.healthChecks.filter(h => h.uptime >= oneHourAgo);
    
    const cleaned = initialCount - this.metrics.length;
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old performance metrics`);
    }
  }

  // Sanitize query for logging (remove sensitive data)
  private sanitizeQuery(query: string): string {
    // Remove potential sensitive data patterns
    return query
      .replace(/('.*?')/g, "'***'")  // Replace string literals
      .replace(/\b\d{4,}\b/g, '***') // Replace long numbers (potential IDs)
      .substring(0, 200); // Limit length
  }
}

// =============================================================================
// PERFORMANCE MONITORING MIDDLEWARE
// Automatic monitoring for database operations
// =============================================================================

export class MonitoredStorage {
  private monitor: QueryPerformanceMonitor;
  public storage: any;

  constructor(storage: any) {
    this.storage = storage;
    this.monitor = new QueryPerformanceMonitor();
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  // Wrap storage methods with monitoring
  wrapMethod(methodName: string): any {
    const originalMethod = this.storage[methodName];
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }

    return async (...args: any[]) => {
      const startTime = Date.now();
      const queryDescription = `${methodName}(${args.map(arg => 
        typeof arg === 'string' ? arg.substring(0, 50) : typeof arg
      ).join(', ')})`;

      try {
        const result = await originalMethod.apply(this.storage, args);
        const duration = Date.now() - startTime;
        
        this.monitor.recordQuery(
          queryDescription,
          methodName,
          duration,
          true
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.monitor.recordQuery(
          queryDescription,
          methodName,
          duration,
          false,
          error instanceof Error ? error.message : String(error)
        );
        
        throw error;
      }
    };
  }

  // Start periodic health checks
  private startHealthChecks(): void {
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        // Test basic database connectivity
        if (this.storage.db && typeof this.storage.db.execute === 'function') {
          await this.storage.db.execute('SELECT 1');
        }
        
        const responseTime = Date.now() - startTime;
        
        // Get cache stats if available
        let cacheHitRate = 0;
        if (this.storage.getCacheStats) {
          const cacheStats = this.storage.getCacheStats();
          cacheHitRate = cacheStats.hitRate;
        }

        this.monitor.recordHealthCheck({
          connectionStatus: 'connected',
          responseTime,
          cacheHitRate,
          errorCount: 0
        });
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        this.monitor.recordHealthCheck({
          connectionStatus: 'error',
          responseTime,
          errorCount: 1,
          lastError: error instanceof Error ? error.message : String(error)
        });
      }
    };

    // Check health every 30 seconds
    setInterval(checkHealth, 30 * 1000);
    
    // Initial health check
    checkHealth();
  }

  // Get monitoring data
  getMonitoringData() {
    return {
      performance: this.monitor.getPerformanceStats(),
      health: this.monitor.getDatabaseHealth(),
      slowQueries: this.monitor.getSlowQueries(10),
      errorQueries: this.monitor.getErrorQueries(10)
    };
  }

  // Get performance monitor instance
  getMonitor(): QueryPerformanceMonitor {
    return this.monitor;
  }
}

// Create monitored storage wrapper
export function createMonitoredStorage(storage: any): any {
  const monitoredStorage = new MonitoredStorage(storage);
  
  // Create proxy to wrap all methods with monitoring
  return new Proxy(monitoredStorage, {
    get(target, prop, receiver) {
      // If it's a monitoring method (exists on MonitoredStorage), return it directly
      if (prop in target && typeof (target as any)[prop] === 'function') {
        return Reflect.get(target, prop, receiver);
      }
      
      // If it's a property that exists on MonitoredStorage but not a function, return it
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      
      // If it's a storage method, wrap it with monitoring
      if (prop in target.storage && typeof target.storage[prop] === 'function') {
        return target.wrapMethod(prop as string);
      }
      
      // Return property from storage if it exists
      if (prop in target.storage) {
        return target.storage[prop];
      }
      
      return Reflect.get(target, prop, receiver);
    }
  });
}

// Global performance monitor instance
export const globalPerformanceMonitor = new QueryPerformanceMonitor();