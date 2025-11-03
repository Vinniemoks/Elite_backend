const { PrismaClient } = require('@prisma/client');
const Redis = require('redis');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Redis Client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  prisma,
  redisClient,
  connectRedis,
};