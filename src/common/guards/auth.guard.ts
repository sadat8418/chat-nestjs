import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const auth = req.headers['authorization'];

    if (!auth) return false;

    const token = auth.split(' ')[1];

    if (!token) return false;

    const session = await this.redis.get(`session:${token}`);

    if (!session) return false;

    // 🔥 attach user to request
    req.user = session;

    return true;
  }
}