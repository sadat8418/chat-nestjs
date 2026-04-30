import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  // public client = new Redis(process.env.REDIS_URL);
  public client = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
);
  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      await this.client.set(key, JSON.stringify(value));
    }
  }

  async get(key: string) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async sAdd(key: string, value: string) {
    return this.client.sadd(key, value);
  }

  async sRem(key: string, value: string) {
    return this.client.srem(key, value);
  }

  async sMembers(key: string) {
    return this.client.smembers(key);
  }
}