import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { users } from '../database/schema';
import { v4 as uuid } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(private redis: RedisService) {}

  async login(username: string) {
    
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    let user = result[0];

    if (!user) {
      user = {
        id: `usr_${uuid()}`,
        username,
        createdAt: new Date()
      };

      await db.insert(users).values(user);
    }

    const token = uuid();

    await this.redis.set(
      `session:${token}`,
      user,
      60 * 60 * 24 // 24h
    );

    return { sessionToken: token, user }; // ✅ match API contract
  }
}