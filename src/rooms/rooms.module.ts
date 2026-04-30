import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RedisService],
})
export class RoomsModule {}