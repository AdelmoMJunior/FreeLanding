type RateLimitEntry = Readonly<{
  count: number;
  resetAt: number;
}>;

export type RateLimitStore = Map<string, RateLimitEntry>;

type RateLimitOptions = Readonly<{
  limit: number;
  windowMs: number;
  maxEntries?: number;
  now?: number;
  store?: RateLimitStore;
}>;

export type RateLimitResult =
  | Readonly<{
      allowed: true;
      remaining: number;
    }>
  | Readonly<{
      allowed: false;
      remaining: 0;
      retryAfterSeconds: number;
    }>;

const defaultStore: RateLimitStore = new Map();

export function createRateLimitStore(): RateLimitStore {
  return new Map();
}

function pruneExpiredEntries(store: RateLimitStore, now: number) {
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  });
}

function makeSpaceForNewEntry(store: RateLimitStore, maxEntries: number | undefined, key: string, now: number) {
  if (!maxEntries || maxEntries < 1 || store.has(key) || store.size < maxEntries) {
    return;
  }

  pruneExpiredEntries(store, now);

  while (store.size >= maxEntries) {
    const oldestKey = store.keys().next().value;

    if (!oldestKey) {
      return;
    }

    store.delete(oldestKey);
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const store = options.store ?? defaultStore;
  const now = options.now ?? Date.now();
  makeSpaceForNewEntry(store, options.maxEntries, key, now);
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });

    return { allowed: true, remaining: Math.max(options.limit - 1, 0) };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
    };
  }

  const nextCount = current.count + 1;
  store.set(key, { count: nextCount, resetAt: current.resetAt });

  return { allowed: true, remaining: Math.max(options.limit - nextCount, 0) };
}
