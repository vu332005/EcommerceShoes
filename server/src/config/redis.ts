import Redis from "ioredis";

// Kết nối đến Redis trong Docker (localhost:6379)
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost", 
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis Client Error", err);
});

export default redis;