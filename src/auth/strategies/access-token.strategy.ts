import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { extractTokenFromCookies } from 'src/common/helpers/extract-jwt.helper';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from '../auth.types';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookies("jwt")]),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this.userService.findOne(payload.userId)

    return user
  }
}