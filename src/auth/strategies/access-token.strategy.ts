import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { extractTokenFromCookies } from 'src/common/helpers/extract-jwt.helper';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../auth.types';
import { User } from 'src/user/entities/user.entity';
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
    return await this.userService.findOne(payload.userId)
  }
}