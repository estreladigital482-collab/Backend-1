import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock para cache de memória com 5min TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should set and get cache entries", () => {
    cache.set("key1", { data: "value1" });
    const result = cache.get("key1");
    expect(result).toEqual({ data: "value1" });
  });

  it("should return null for missing keys", () => {
    const result = cache.get("nonexistent");
    expect(result).toBeNull();
  });

  it("should expire entries after TTL", () => {
    cache.set("key1", { data: "value1" }, 1000);
    expect(cache.get("key1")).toEqual({ data: "value1" });

    vi.advanceTimersByTime(1001);
    expect(cache.get("key1")).toBeNull();
  });

  it("should use default 5-minute TTL", () => {
    cache.set("key1", { data: "value1" });
    vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes
    expect(cache.get("key1")).toEqual({ data: "value1" });

    vi.advanceTimersByTime(2 * 60 * 1000); // 2 more minutes (total > 5min)
    expect(cache.get("key1")).toBeNull();
  });

  it("should clear all entries", () => {
    cache.set("key1", { data: "value1" });
    cache.set("key2", { data: "value2" });
    cache.clear();

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
  });

  it("should check if key exists without expiring", () => {
    cache.set("key1", { data: "value1" }, 1000);
    expect(cache.has("key1")).toBe(true);

    vi.advanceTimersByTime(1001);
    expect(cache.has("key1")).toBe(false);
  });
});

// Mock para paginação de histórico
interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
}

class HistoryPaginator {
  private state: PaginationState;

  constructor(pageSize: number = 20) {
    this.state = {
      page: 0,
      pageSize,
      totalItems: 0,
      hasMore: false,
    };
  }

  loadPage(items: any[], totalCount: number): any[] {
    this.state.totalItems = totalCount;
    const start = this.state.page * this.state.pageSize;
    const end = start + this.state.pageSize;
    const isLastPage = end >= totalCount;
    this.state.hasMore = !isLastPage;
    return items.slice(start, end);
  }

  nextPage(): void {
    if (this.state.hasMore) {
      this.state.page++;
    }
  }

  reset(): void {
    this.state.page = 0;
    this.state.hasMore = false;
    this.state.totalItems = 0;
  }

  getState(): PaginationState {
    return { ...this.state };
  }
}

describe("HistoryPaginator", () => {
  let paginator: HistoryPaginator;

  beforeEach(() => {
    paginator = new HistoryPaginator(20);
  });

  it("should load first page correctly", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    const page = paginator.loadPage(items, 50);

    expect(page).toHaveLength(20);
    expect(page[0].id).toBe(0);
    expect(page[19].id).toBe(19);
  });

  it("should indicate when more items exist", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    paginator.loadPage(items, 50);

    const state = paginator.getState();
    expect(state.hasMore).toBe(true);
  });

  it("should load next page correctly", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    paginator.loadPage(items, 50);
    paginator.nextPage();

    const page = paginator.loadPage(items, 50);
    expect(page[0].id).toBe(20);
    expect(page[19].id).toBe(39);
  });

  it("should handle last page correctly", () => {
    const items = Array.from({ length: 45 }, (_, i) => ({ id: i }));
    paginator.loadPage(items, 45);

    let state = paginator.getState();
    expect(state.hasMore).toBe(true); // First page (0-19) has more

    paginator.nextPage();
    paginator.loadPage(items, 45);
    state = paginator.getState();
    expect(state.hasMore).toBe(true); // Second page (20-39) has more

    paginator.nextPage();
    paginator.loadPage(items, 45);
    state = paginator.getState();
    expect(state.hasMore).toBe(false); // Third page (40-44) no more
  });

  it("should reset pagination state", () => {
    const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
    paginator.loadPage(items, 50);
    paginator.nextPage();

    paginator.reset();
    const state = paginator.getState();

    expect(state.page).toBe(0);
    expect(state.hasMore).toBe(false);
    expect(state.totalItems).toBe(0);
  });

  it("should handle custom page size", () => {
    const customPaginator = new HistoryPaginator(10);
    const items = Array.from({ length: 30 }, (_, i) => ({ id: i }));
    const page = customPaginator.loadPage(items, 30);

    expect(page).toHaveLength(10);
    expect(page[0].id).toBe(0);
    expect(page[9].id).toBe(9);
  });
});
