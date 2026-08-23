import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisConfig);
