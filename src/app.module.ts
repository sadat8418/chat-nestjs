import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './websocket/chat.module';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), // 🔥
    AuthModule,
  RoomsModule,
MessagesModule,
RedisModule,
ChatModule, ],
  controllers: [AppController],
  providers: [AuthGuard, AppService],
})
export class AppModule {}
