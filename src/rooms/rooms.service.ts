import { Injectable } from '@nestjs/common';
import { db } from '../database/db';
import { rooms } from '../database/schema';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';

@Injectable()
export class RoomsService {
  async create(name: string, user) {
    const existing = await db
  .select()
  .from(rooms)
  .where(eq(rooms.name, name))
  .limit(1);

if (existing.length) {
  throw {
    code: 'ROOM_NAME_TAKEN',
    message: 'A room with this name already exists',
    status: 409
  };
}
    const room = {
      id: `room_${uuid()}`,
      name,
      createdBy: user.username,
      createdAt: new Date()
    };

    await db.insert(rooms).values(room);
    return room;
  }

  async findAll(redis) {
    const all = await db.select().from(rooms);

    const enriched = await Promise.all(
      all.map(async (room) => {
        const users = await redis.sMembers(`room:${room.id}:users`);
        return { ...room, activeUsers: users.length };
      })
    );

    return enriched;
  }

  async findOne(id, redis) {
    // const room = await db.query.rooms.findFirst({
    //   where: (r, { eq }) => eq(r.id, id)
    // });
const result = await db
  .select()
  .from(rooms)
  .where(eq(rooms.id, id))
  .limit(1);

const room = result[0];
    if (!room) {
      throw {
        code: 'ROOM_NOT_FOUND',
        message: `Room with id ${id} does not exist`,
        status: 404
      };
    }

    const users = await redis.sMembers(`room:${id}:users`);

    return { ...room, activeUsers: users.length };
  }

  async delete(id, user, redis, pub) {
    const room = await this.findOne(id, redis);

    if (room.createdBy !== user.username) {
      throw {
        code: 'FORBIDDEN',
        message: 'Only the room creator can delete this room',
        status: 403
      };
    }

    // emit BEFORE delete
    await pub.publish(
      `room:${id}:events`,
      JSON.stringify({ type: 'room:deleted', roomId: id })
    );

    await db.delete(rooms).where(eq(rooms.id, id));

    return { deleted: true };
  }
}