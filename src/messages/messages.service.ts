import { db } from '../database/db';
import { messages } from '../database/schema';
import { v4 as uuid } from 'uuid';
import { eq, lt, desc, and } from 'drizzle-orm';

export class MessagesService {
  async create(roomId, user, content, pub) {
    if (!content || content.length > 1000) {
      throw {
        code: 'MESSAGE_TOO_LONG',
        message: 'Message content must not exceed 1000 characters',
        status: 422
      };
    }

    const message = {
      id: `msg_${uuid()}`,
      roomId,
      username: user.username,
      content: content.trim(),
      createdAt: new Date()
    };

    await db.insert(messages).values(message);

    // publish to redis
    await pub.publish(
      `room:${roomId}:messages`,
      JSON.stringify(message)
    );

    return message;
  }

  async get(roomId, limit = 50, cursor?) {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    // if (cursor) {
    //   query = query.where(lt(messages.id, cursor));
    // }
let result;

if (cursor) {
  result = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.roomId, roomId),
        lt(messages.id, cursor)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
} else {
  result = await db
    .select()
    .from(messages)
    .where(eq(messages.roomId, roomId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}
    // const result = await query;

    return {
      messages: result,
      hasMore: result.length === limit,
      nextCursor: result.length ? result[result.length - 1].id : null
    };
  }
}