export const RATE_LIMIT_MAX_TOKENS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
export const RATE_LIMIT_STORAGE_KEY = 'devpulse_rate_limiter_v1';

export interface RateBucketState {
  tokens: number;
  lastRefillTimestamp: number;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultStorage(): StorageAdapter | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/**
 * Computes the refilled token bucket state given current time `now`.
 */
export function computeRefilledBucket(
  prev: RateBucketState | null,
  now: number,
  maxTokens = RATE_LIMIT_MAX_TOKENS,
  windowMs = RATE_LIMIT_WINDOW_MS
): RateBucketState {
  if (!prev || typeof prev.tokens !== 'number' || typeof prev.lastRefillTimestamp !== 'number') {
    return { tokens: maxTokens, lastRefillTimestamp: now };
  }
  const elapsed = Math.max(0, now - prev.lastRefillTimestamp);
  if (elapsed >= windowMs) {
    return { tokens: maxTokens, lastRefillTimestamp: now };
  }
  // Continuous proportional refill over the 60s window
  const refillCount = Math.floor((elapsed / windowMs) * maxTokens);
  if (refillCount > 0) {
    const newTokens = Math.min(maxTokens, prev.tokens + refillCount);
    const advancedTime = prev.lastRefillTimestamp + Math.floor((refillCount / maxTokens) * windowMs);
    return {
      tokens: newTokens,
      lastRefillTimestamp: newTokens === maxTokens ? now : advancedTime,
    };
  }
  return prev;
}

/**
 * Checks and consumes 1 generation token from the localStorage token bucket.
 * If the user has configured their own BYOK key, bypasses the free tier limit.
 */
export function consumeGenerationToken(
  hasByokKey = false,
  now = Date.now(),
  storage: StorageAdapter | null = getDefaultStorage()
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  if (hasByokKey) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_TOKENS, resetInSeconds: 0 };
  }

  let current: RateBucketState | null = null;
  if (storage) {
    try {
      const raw = storage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch {
      current = null;
    }
  }

  const refilled = computeRefilledBucket(current, now);
  if (refilled.tokens <= 0) {
    const elapsed = Math.max(0, now - refilled.lastRefillTimestamp);
    const resetInSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  const updated: RateBucketState = {
    tokens: refilled.tokens - 1,
    lastRefillTimestamp: refilled.lastRefillTimestamp,
  };

  if (storage) {
    try {
      storage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  }

  const elapsed = Math.max(0, now - updated.lastRefillTimestamp);
  const resetInSeconds = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000));
  return { allowed: true, remaining: updated.tokens, resetInSeconds };
}

/**
 * Reads the remaining free-tier tokens without consuming one.
 */
export function getRemainingTokens(
  now = Date.now(),
  storage: StorageAdapter | null = getDefaultStorage()
): { remaining: number; max: number } {
  let current: RateBucketState | null = null;
  if (storage) {
    try {
      const raw = storage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch {
      current = null;
    }
  }
  const refilled = computeRefilledBucket(current, now);
  return { remaining: refilled.tokens, max: RATE_LIMIT_MAX_TOKENS };
}
