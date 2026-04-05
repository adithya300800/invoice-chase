const rateLimitMap = new Map<string, { count: number; last: number }>()
const WINDOW = 60 * 1000 // 1 minute
const MAX = 100

export function rateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  if (!record || now - record.last > WINDOW) {
    rateLimitMap.set(key, { count: 1, last: now })
    return { allowed: true, remaining: MAX - 1 }
  }
  if (record.count >= MAX) return { allowed: false, remaining: 0 }
  record.count++
  return { allowed: true, remaining: MAX - record.count }
}
