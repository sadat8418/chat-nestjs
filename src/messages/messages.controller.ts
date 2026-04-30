// import {
//   Controller,
//   Get,
//   Post,
//   Param,
//   Body,
//   Query,
//   Req,
//   UseGuards
// } from '@nestjs/common';

// import { MessagesService } from './messages.service';
// import { AuthGuard } from '../common/guards/auth.guard';
// import { RedisService } from '../redis/redis.service';

// @Controller('/api/v1/rooms/:id/messages')
// @UseGuards(AuthGuard)
// export class MessagesController {
//   constructor(
//     private messages: MessagesService,
//     private redis: RedisService
//   ) {}

//   @Get()
//   async list(@Param('id') id, @Query() query) {
//     const data = await this.messages.get(
//       id,
//       Number(query.limit) || 50,
//       query.before
//     );

//     return { success: true, data };
//   }

//   @Post()
//   async create(@Param('id') id, @Body() body, @Req() req) {
//     const message = await this.messages.create(
//       id,
//       req.user,
//       body.content,
//       this.redis.client
//     );

//     return { success: true, data: message };
//   }
// }

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { RedisService } from '../redis/redis.service';

@Controller('api/v1/rooms/:id/messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private redis: RedisService
  ) {}

  @Get()
  async getMessages(
    @Param('id') roomId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string
  ) {
    return {
      success: true,
      data: await this.messagesService.get(roomId, limit, before)
    };
  }

  @Post()
  async sendMessage(
    @Param('id') roomId: string,
    @Body() body,
    @Headers('authorization') auth: string
  ) {
    const token = auth?.split(' ')[1];
    const user = await this.redis.get(`session:${token}`);

    if (!user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      };
    }

    const message = await this.messagesService.create(
      roomId,
      user,
      body.content,
      this.redis.client
    );

    return {
      success: true,
      data: message
    };
  }
}