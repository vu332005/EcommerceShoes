import Redis from "ioredis";

/**
 * Redis Connection:
 * - Production (Upstash): Dùng REDIS_URL với TLS (rediss://)
 * - Development (Docker):  Dùng REDIS_HOST + REDIS_PORT
 */
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      // Bắt buộc với Upstash — cho phép self-signed cert
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});

export default redis;