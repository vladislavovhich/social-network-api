import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  constructor(private reflector: Reflector) {
    super();
  }
 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const user = await request.user;

    const checkVerified = this.reflector.get<boolean>('checkVerified', context.getHandler());

    if (checkVerified == undefined && !user.isVerified) {
      throw new UnauthorizedException('User is not verified')
    }

    if (checkVerified === true && !user.isVerified) {
      throw new UnauthorizedException('User is not verified');
    }
    
    return true;
  }
}