import { randomUUID } from "crypto";

// =============================================================================
// CACHING LAYER FOR PERFORMANCE OPTIMIZATION
// TTL-based memory cache for frequently accessed tournament data
// =============================================================================

export interface CacheEntry<T> {
  data: T;
  expiry: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  evictions: number;
}

export class TournamentCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  } = { hits: 0, misses: 0, evictions: 0 };

  constructor(defaultTtl: number = 5 * 60 * 1000, maxSize: number = 1000) {
    this.defaultTtl = defaultTtl; // 5 minutes default
    this.maxSize = maxSize;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Set data with optional TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiryTime = ttl ?? this.defaultTtl;
    
    // Evict oldest entries if at max capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      expiry: now + expiryTime,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now
    });
  }

  // Get data if not expired
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (entry.expiry < now) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data as T;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all entries
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      totalEntries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      totalSize: this.calculateSize(),
      evictions: this.stats.evictions
    };
  }

  // Manual cleanup of expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Evict oldest/least used entries
  private evictOldest(): void {
    if (this.cache.size === 0) return;
    
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    // Find least recently accessed entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Estimate memory usage
  private calculateSize(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Unicode characters are 2 bytes
      size += JSON.stringify(entry.data).length * 2;
      size += 40; // Approximate overhead per entry
    }
    return size;
  }

  // Get cache entries for debugging
  getEntries(): Array<{ key: string; entry: CacheEntry<any> }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }
}

// =============================================================================
// CACHED STORAGE WRAPPER
// Wraps storage interface with intelligent caching
// =============================================================================

import type { IStorage } from './storage';
import type { 
  Tournament, SportOption, SportCategory, TournamentStructure, 
  TrackEvent, SportDivisionRules, User, Contact, Donor 
} from '@shared/schema';

export class CachedStorage implements IStorage {
  private cache: TournamentCache;
  private storage: IStorage;

  constructor(storage: IStorage, cacheTtl: number = 5 * 60 * 1000) {
    this.storage = storage;
    this.cache = new TournamentCache(cacheTtl);
  }

  // =============================================================================
  // CACHED READ OPERATIONS
  // =============================================================================

  async getSportCategories(): Promise<SportCategory[]> {
    const cacheKey = 'sport_categories:all';
    let cached = this.cache.get<SportCategory[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getSportCategories();
    this.cache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes - rarely changes
    return data;
  }

  async getSportOptions(): Promise<SportOption[]> {
    const cacheKey = 'sport_options:all';
    let cached = this.cache.get<SportOption[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getSportOptions();
    this.cache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes
    return data;
  }

  async getTournamentStructures(): Promise<TournamentStructure[]> {
    const cacheKey = 'tournament_structures:all';
    let cached = this.cache.get<TournamentStructure[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getTournamentStructures();
    this.cache.set(cacheKey, data, 15 * 60 * 1000); // 15 minutes - rarely changes
    return data;
  }

  async getTrackEvents(): Promise<TrackEvent[]> {
    const cacheKey = 'track_events:all';
    let cached = this.cache.get<TrackEvent[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getTrackEvents();
    this.cache.set(cacheKey, data, 15 * 60 * 1000); // 15 minutes
    return data;
  }

  async getTournaments(userId?: string): Promise<Tournament[]> {
    const cacheKey = userId ? `tournaments:user:${userId}` : 'tournaments:all';
    let cached = this.cache.get<Tournament[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getTournaments(userId);
    this.cache.set(cacheKey, data, 2 * 60 * 1000); // 2 minutes - more dynamic
    return data;
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const cacheKey = `tournament:${id}`;
    let cached = this.cache.get<Tournament>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getTournament(id);
    if (data) {
      this.cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes
    }
    return data;
  }

  async getUser(id: string): Promise<User | undefined> {
    const cacheKey = `user:${id}`;
    let cached = this.cache.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const data = await this.storage.getUser(id);
    if (data) {
      this.cache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes
    }
    return data;
  }

  // =============================================================================
  // CACHE INVALIDATION ON WRITES
  // =============================================================================

  async createTournament(tournament: any): Promise<Tournament> {
    const result = await this.storage.createTournament(tournament);
    
    // Invalidate related caches
    this.invalidateTournamentCaches(tournament.userId);
    
    return result;
  }

  async updateTournament(id: string, tournament: any): Promise<Tournament | undefined> {
    const result = await this.storage.updateTournament(id, tournament);
    
    if (result) {
      // Invalidate specific tournament and user tournament list
      this.cache.delete(`tournament:${id}`);
      this.invalidateTournamentCaches(result.userId);
    }
    
    return result;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const tournament = await this.storage.getTournament(id);
    const result = await this.storage.deleteTournament(id);
    
    if (result && tournament) {
      this.cache.delete(`tournament:${id}`);
      this.invalidateTournamentCaches(tournament.userId);
    }
    
    return result;
  }

  async createSportOption(sport: any): Promise<SportOption> {
    const result = await this.storage.createSportOption(sport);
    
    // Invalidate sport options cache
    this.cache.delete('sport_options:all');
    
    return result;
  }

  // =============================================================================
  // CACHE MANAGEMENT UTILITIES
  // =============================================================================

  private invalidateTournamentCaches(userId?: string): void {
    this.cache.delete('tournaments:all');
    if (userId) {
      this.cache.delete(`tournaments:user:${userId}`);
    }
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanupCache(): number {
    return this.cache.cleanup();
  }

  // =============================================================================
  // PASS-THROUGH METHODS (All other IStorage methods)
  // =============================================================================

  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.storage.getUserByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.storage.getAllUsers();
  }

  async upsertUser(user: any): Promise<User> {
    const result = await this.storage.upsertUser(user);
    // Invalidate user cache
    this.cache.delete(`user:${result.id}`);
    return result;
  }

  async updateUser(id: string, updates: any): Promise<User | undefined> {
    const result = await this.storage.updateUser(id, updates);
    if (result) {
      this.cache.delete(`user:${id}`);
    }
    return result;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User | undefined> {
    const result = await this.storage.updateUserStripeInfo(id, customerId, subscriptionId);
    if (result) {
      this.cache.delete(`user:${id}`);
    }
    return result;
  }

  // All other methods pass through directly to storage
  // (This is a simplified implementation - in production you'd implement all methods)
  
  // For now, delegate everything else to the wrapped storage
  [key: string]: any;
}

// Create proxy to automatically delegate unimplemented methods
export function createCachedStorage(storage: IStorage, cacheTtl?: number): IStorage {
  const cachedStorage = new CachedStorage(storage, cacheTtl);
  
  return new Proxy(cachedStorage, {
    get(target, prop, receiver) {
      // Convert prop to string for consistent checks
      const propStr = String(prop);
      
      // If method exists on CachedStorage instance, use it (cached methods get priority)
      if (propStr in target && typeof (target as any)[propStr] === 'function') {
        return Reflect.get(target, prop, receiver);
      }
      
      // If it's a property that exists on CachedStorage but not a function, return it
      if (propStr in target) {
        return Reflect.get(target, prop, receiver);
      }
      
      // Check if the method exists on the wrapped storage
      const wrappedStorage = (target as any).storage;
      if (wrappedStorage && propStr in wrappedStorage) {
        const storageMethod = wrappedStorage[propStr];
        if (typeof storageMethod === 'function') {
          // Return bound function to maintain proper context
          return storageMethod.bind(wrappedStorage);
        }
        // Return non-function properties directly
        return storageMethod;
      }
      
      // Fallback to default behavior
      return Reflect.get(target, prop, receiver);
    }
  });
}