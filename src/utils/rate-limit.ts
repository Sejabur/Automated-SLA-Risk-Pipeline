const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true; // Allowed
  }

  if (now - record.lastReset > windowMs) {
    // Reset window
    record.count = 1;
    record.lastReset = now;
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  return true; // Allowed
}
