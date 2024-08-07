import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { extractTokenFromCookies } from 'src/common/helpers/extract-jwt.helper';
import { JwtPayload } from '../auth.types';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/configuration';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    const secret = configService.get<JwtConfig>('passport').refresh.secret
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookies("jwt-refresh")]),
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    return await this.userService.findOne(payload.userId)
  }
}