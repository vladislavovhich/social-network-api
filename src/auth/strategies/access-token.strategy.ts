import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { extractTokenFromCookies } from 'src/common/helpers/extract-jwt.helper';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../auth.types';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/configuration.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    const secret = configService.get<JwtConfig>('passport').access.secret
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookies("jwt")]),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const user = await this.userService.findOne(payload.userId)

      return user
    } catch (error: any) {
      throw new UnauthorizedException("Not authorized")
    }
  }
}