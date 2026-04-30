import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  namespace: '/chat',
   cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private redis: RedisService) {}

  // ✅ CONNECTION
  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.query.token as string;
      const roomId = socket.handshake.query.roomId as string;

      if (!token || !roomId) {
        console.log('❌ Missing token/roomId');
        return socket.disconnect();
      }

      const session = await this.redis.get(`session:${token}`);

      if (!session) {
        console.log('❌ Invalid session');
        return socket.disconnect();
      }

      const user = session;

      socket.data.user = user;
      socket.data.roomId = roomId;

      socket.join(roomId);

      await this.redis.sAdd(`room:${roomId}:users`, user.username);

      const users = await this.redis.sMembers(`room:${roomId}:users`);

      socket.emit('room:joined', { activeUsers: users });

      socket.to(roomId).emit('room:user_joined', {
        username: user.username,
        activeUsers: users
      });

      console.log(`✅ ${user.username} joined ${roomId}`);
    } catch (err) {
      console.error('❌ WS connection error:', err);
      socket.disconnect();
    }
  }

  // ✅ DISCONNECT
  async handleDisconnect(socket: Socket) {
    try {
      const { user, roomId } = socket.data || {};

      if (!user || !roomId) return;

      await this.redis.sRem(`room:${roomId}:users`, user.username);

      const users = await this.redis.sMembers(`room:${roomId}:users`);

      this.server.to(roomId).emit('room:user_left', {
        username: user.username,
        activeUsers: users
      });

      console.log(`👋 ${user.username} left ${roomId}`);
    } catch (err) {
      console.error('❌ WS disconnect error:', err);
    }
  }

  // ✅ REDIS SUBSCRIBER
  // async afterInit() {
  //   const sub = this.redis.client.duplicate();

  //   // ⚠️ important
  //   await sub.connect();

  //   await sub.psubscribe('room:*:messages');
  //   await sub.psubscribe('room:*:events');

  //   sub.on('pmessage', (pattern: string, channel: string, msg: string) => {
  //     try {
  //       const data = JSON.parse(msg);

  //       if (channel.includes(':messages')) {
  //         this.server.to(data.roomId).emit('message:new', data);
  //       }

  //       if (channel.includes(':events') && data.type === 'room:deleted') {
  //         this.server.to(data.roomId).emit('room:deleted', {
  //           roomId: data.roomId
  //         });
  //       }
  //     } catch (err) {
  //       console.error('❌ Redis message error:', err);
  //     }
  //   });

  //   console.log('✅ Redis subscriber ready');
  // }
  async afterInit() {
  console.log("🔥 ChatGateway initialized");

  const sub = this.redis.client.duplicate();

  // ❌ DO NOT call connect()

  await sub.psubscribe('room:*:messages', 'room:*:events');

  sub.on('pmessage', (pattern, channel, msg) => {
    const data = JSON.parse(msg);

    if (channel.includes(':messages')) {
      this.server.to(data.roomId).emit('message:new', data);
    }

    if (channel.includes(':events') && data.type === 'room:deleted') {
      this.server.to(data.roomId).emit('room:deleted', {
        roomId: data.roomId
      });
    }
  });
}

  // ✅ CLIENT EVENT
  @SubscribeMessage('room:leave')
  async leave(socket: Socket) {
    const { user, roomId } = socket.data;

    if (!user || !roomId) return;

    await this.redis.sRem(`room:${roomId}:users`, user.username);

    const users = await this.redis.sMembers(`room:${roomId}:users`);

    this.server.to(roomId).emit('room:user_left', {
      username: user.username,
      activeUsers: users
    });

    socket.disconnect();
  }
}