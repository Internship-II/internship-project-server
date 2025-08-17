import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private requestTimes: Map<string, number[]> = new Map();
  private memoryUsage: { [key: string]: number } = {};

  startTimer(operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordRequestTime(operation, duration);
      
      if (duration > 1000) { // Log slow operations (>1s)
        this.logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      }
    };
  }

  private recordRequestTime(operation: string, duration: number): void {
    if (!this.requestTimes.has(operation)) {
      this.requestTimes.set(operation, []);
    }
    this.requestTimes.get(operation)!.push(duration);
    
    // Keep only last 100 measurements
    const times = this.requestTimes.get(operation)!;
    if (times.length > 100) {
      times.shift();
    }
  }

  getAverageResponseTime(operation: string): number {
    const times = this.requestTimes.get(operation);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / times.length);
  }

  getPerformanceStats(): any {
    const stats: any = {};
    
    for (const [operation, times] of this.requestTimes.entries()) {
      if (times.length > 0) {
        const avg = this.getAverageResponseTime(operation);
        const min = Math.min(...times);
        const max = Math.max(...times);
        const p95 = this.getPercentile(times, 95);
        
        stats[operation] = {
          count: times.length,
          average: avg,
          min,
          max,
          p95,
        };
      }
    }

    // Add memory usage
    const memUsage = process.memoryUsage();
    stats.memory = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    };

    return stats;
  }

  private getPercentile(times: number[], percentile: number): number {
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  logPerformanceStats(): void {
    const stats = this.getPerformanceStats();
    this.logger.log('Performance Statistics:', JSON.stringify(stats, null, 2));
  }
} 