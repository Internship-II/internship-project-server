import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly publicPaths = [
    '/auth/register',
    '/auth/login',
    '/users/verify-email',
    '/public/verify-email'
  ];

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const path = request.path;

    this.logger.debug(`Checking path: ${path}`);

    // Check if the path is in the public paths list
    if (this.publicPaths.includes(path)) {
      this.logger.debug(`Path ${path} is public`);
      return true;
    }

    // Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(`Route is marked as public`);
      return true;
    }

    return super.canActivate(context);
  }
}
