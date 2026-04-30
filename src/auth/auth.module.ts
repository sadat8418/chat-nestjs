import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RedisService],
})
export class AuthModule {}