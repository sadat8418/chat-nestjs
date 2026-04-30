// import {
//   Controller,
//   Get,
//   Post,
//   Delete,
//   Param,
//   Body,
//   Req,
//   UseGuards
// } from '@nestjs/common';

// import { RoomsService } from './rooms.service';
// import { AuthGuard } from '../common/guards/auth.guard';
// import { RedisService } from '../redis/redis.service';

// @Controller('/api/v1/rooms')
// @UseGuards(AuthGuard)
// export class RoomsController {
//   constructor(
//     private rooms: RoomsService,
//     private redis: RedisService
//   ) {}

//   @Get()
//   async all() {
//     const rooms = await this.rooms.findAll(this.redis);
//     return { success: true, data: { rooms } };
//   }

//   @Post()
//   async create(@Body() body, @Req() req) {
//     const room = await this.rooms.create(body.name, req.user);
//     return { success: true, data: room };
//   }

//   @Get(':id')
//   async one(@Param('id') id) {
//     const room = await this.rooms.findOne(id, this.redis);
//     return { success: true, data: room };
//   }

//   @Delete(':id')
//   async remove(@Param('id') id, @Req() req) {
//     const result = await this.rooms.delete(
//       id,
//       req.user,
//       this.redis,
//       this.redis.client
//     );

//     return { success: true, data: result };
//   }
// }

import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
    Delete,

  Param,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RedisService } from '../redis/redis.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('api/v1/rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(
    private rooms: RoomsService,
    private redis: RedisService
  ) {}

  // GET /rooms
  @Get()
  async findAll() {
    const data = await this.rooms.findAll(this.redis);

    return {
      success: true,
      data: {
        rooms: data
      }
    };
  }

  // POST /rooms
  // @Post()
  // async create(@Body() body: { name: string }) {
  //   // TEMP fake user (we'll fix auth later)
  //   const user = { username: 'ali_123' };

  //   const room = await this.rooms.create(body.name, user);

  //   return {
  //     success: true,
  //     data: room
  //   };
  // }

@Post()
async create(@Body() body: { name: string }, @Req() req) {
  console.log("REQ.USER:", req.user); // 👈 ADD THIS

  const room = await this.rooms.create(body.name, req.user);

  return {
    success: true,
    data: room
  };
}
    @Get(':id')
  async one(@Param('id') id) {
    const room = await this.rooms.findOne(id, this.redis);
    return { success: true, data: room };
  }

  @Delete(':id')
  async remove(@Param('id') id, @Req() req) {
    const result = await this.rooms.delete(
      id,
      req.user,
      this.redis,
      this.redis.client
    );

    return { success: true, data: result };
  }
}