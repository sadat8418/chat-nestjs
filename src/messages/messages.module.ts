import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, RedisService],
})
export class MessagesModule {}