import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('/api/v1')
export class AuthController {
  constructor(private auth: AuthService) {}

 @Post('/login')
async login(@Body() body: { username: string }) {
  const { sessionToken, user } = await this.auth.login(body.username);

  return {
    success: true,
    data: {
      sessionToken,
      user
    }
  };
}
}