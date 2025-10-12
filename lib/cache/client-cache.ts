/**
 * Client-side cache to prevent redundant API calls and reduce Vercel compute usage
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private idbDbName = "spout-client-cache";
  private idbStoreName = "cache";

  /**
   * Get cached data or fetch if not available/expired
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000, // 5 minutes default
  ): Promise<T> {
    // Prevent infinite loops by checking for circular dependencies
    if (key.length > 200) {
      throw new Error(
        `Cache key too long, possible infinite loop: ${key.substring(0, 50)}...`,
      );
    }

    // Check if we have a valid cached entry (L1 - memory)
    const cached = this.get<T>(key);
    if (cached !== null) {
      console.log(`🎯 Client cache HIT (memory): ${key}`);
      return cached;
    }

    // Attempt L2 - IndexedDB read on memory miss
    const idbEntry = await this.idbGet<CacheEntry<T>>(key);
    if (idbEntry) {
      const now = Date.now();
      const isExpired = now - idbEntry.timestamp > idbEntry.ttl;
      if (!isExpired) {
        this.cache.set(key, idbEntry);
        console.log(`🎯 Client cache HIT (IndexedDB): ${key}`);
        return idbEntry.data;
      } else {
        // Clean up expired entry from IDB
        await this.idbDelete(key);
      }
    }

    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Deduplicating request: ${key}`);
      return this.pendingRequests.get(key)!;
    }

    console.log(`🌐 Client cache MISS: ${key}`);

    // Create and store the pending request with timeout
    const request = Promise.race([
      fetcher(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout for ${key}`)),
          30000,
        ),
      ),
    ]).then(
      (data) => {
        this.set(key, data, ttlMs);
        // Write-through to IndexedDB (L2)
        this.idbSet(key, { data, timestamp: Date.now(), ttl: ttlMs }).catch(
          () => {
            // Swallow IDB errors; memory cache still works
          },
        );
        this.pendingRequests.delete(key);
        return data;
      },
      (error) => {
        this.pendingRequests.delete(key);
        throw error;
      },
    );

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Set a value in cache
   */
  private set<T>(key: string, value: T, ttlMs: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    this.cache.set(key, entry);
  }

  /**
   * Get a value from cache if still valid
   */
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }

  // ----------------------
  // IndexedDB (L2) helpers
  // ----------------------
  private async idbOpen(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return null;
    return await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.idbDbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.idbStoreName)) {
          db.createObjectStore(this.idbStoreName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null); // fail soft
    });
  }

  private async idbGet<T>(key: string): Promise<T | null> {
    const db = await this.idbOpen();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(this.idbStoreName, "readonly");
      const store = tx.objectStore(this.idbStoreName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  }

  private async idbSet<T>(key: string, value: T): Promise<void> {
    const db = await this.idbOpen();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(this.idbStoreName, "readwrite");
      const store = tx.objectStore(this.idbStoreName);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  private async idbDelete(key: string): Promise<void> {
    const db = await this.idbOpen();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(this.idbStoreName, "readwrite");
      const store = tx.objectStore(this.idbStoreName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async idbCleanupExpired(): Promise<void> {
    const db = await this.idbOpen();
    if (!db) return;
    const now = Date.now();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(this.idbStoreName, "readwrite");
      const store = tx.objectStore(this.idbStoreName);
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result as IDBCursorWithValue | null;
        if (!cursor) {
          resolve();
          return;
        }
        const entry = cursor.value as CacheEntry<any>;
        const isExpired = now - entry.timestamp > entry.ttl;
        if (isExpired) {
          cursor.delete();
        }
        cursor.continue();
      };
      cursorReq.onerror = () => resolve();
    });
  }
}

// Create singleton instance
const clientCache = new ClientCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== "undefined") {
  const cleanupInterval = setInterval(
    () => {
      clientCache.cleanup();
      // Opportunistic prune of IndexedDB expired rows
      clientCache.idbCleanupExpired().catch(() => {});
    },
    5 * 60 * 1000,
  );

  // Clear interval on page unload to prevent memory leaks
  window.addEventListener("beforeunload", () => {
    clearInterval(cleanupInterval);
  });
}

export default clientCache;

// Helper functions for common API calls
export const clientCacheHelpers = {
  /**
   * Cached market data fetch
   */
  async fetchMarketData(symbol: string) {
    return clientCache.getOrFetch(
      `market-${symbol}`,
      async () => {
        const response = await fetch(`/api/marketdata?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch market data for ${symbol}`);
        }
        return response.json();
      },
      5 * 60 * 1000, // 5 minutes client cache - shorter since no server cache
    );
  },

  /**
   * Cached stock data fetch
   */
  async fetchStockData(ticker: string) {
    return clientCache.getOrFetch(
      `stock-${ticker}`,
      async () => {
        const response = await fetch(`/api/stocks/${ticker}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch stock data for ${ticker}`);
        }
        return response.json();
      },
      5 * 60 * 1000, // 5 minutes client cache - shorter since no server cache
    );
  },

  /**
   * Cached yield data fetch
   */
  async fetchYieldData(symbol: string) {
    return clientCache.getOrFetch(
      `yield-${symbol}`,
      async () => {
        const response = await fetch(`/api/marketdata/yields?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch yield data for ${symbol}`);
        }
        return response.json();
      },
      15 * 60 * 1000, // 15 minutes client cache for yield data
    );
  },

  /**
   * Cached batch stock data fetch
   */
  async fetchBatchStockData(tickers: string[]) {
    const cacheKey = `batch-stocks-${tickers.sort().join(",")}`;
    return clientCache.getOrFetch(
      cacheKey,
      async () => {
        const response = await fetch("/api/stocks/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tickers }),
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch batch stock data`);
        }
        return response.json();
      },
      5 * 60 * 1000, // 5 minutes client cache for batch data
    );
  },
};
