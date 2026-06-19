import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RENDER_BASE = "https://flockwatch-server.onrender.com/data";
const CACHE_TTL = 60 * 60 * 24;

export async function fetchWithCache<T>(
    endpoint: string,
    ttl: number = CACHE_TTL
): Promise<T> {
    const cacheKey = `fw:${endpoint}`;

    const cached = await redis.get<T>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${RENDER_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Render returned ${res.status}`);

    const data: T = await res.json();

    await redis.setex(cacheKey, ttl, data).catch(() => {});

    return data;
}
