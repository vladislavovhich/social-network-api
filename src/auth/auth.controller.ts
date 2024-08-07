import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UploadedFile, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request, Response} from "express"
import { UserEntity } from 'src/user/entities/user.entity';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CheckVerified } from 'src/common/decorators/check-verified.decorator';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor (
      private readonly authService: AuthService
  ) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async me(@GetUser() user: UserEntity) {
    return user
  }

  @Get('confirm')
  @ApiExcludeEndpoint()
  async confirmEmail(@Query('token') token: string, @Res({ passthrough: true }) response: Response) { 
      await this.authService.confirmEmail(token)

      response.status(200).json({message: "Email is successfully confirmed"})
  }

  @Get('confirm-resend')
  @UseGuards(AccessTokenGuard)
  @CheckVerified(false)
  async sendConfirmEmail(@GetUser() user: UserEntity) { 
      return await this.authService.sendConfirmationEmail(user)
  }

  @Post('signin')
  async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) { 
      const result = await this.authService.signIn(loginDto)

      response.cookie("jwt", result.tokens.accessToken, {httpOnly: true, secure: true})
      response.cookie("jwt-refresh", result.tokens.refreshToken, {httpOnly: true, secure: true})

      return result
  }

  @Post('signup') 
  async signUp(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response: Response) {
      const result = await this.authService.signUp(createUserDto)

      response.cookie("jwt", result.tokens.accessToken, {httpOnly: true, secure: true})
      response.cookie("jwt-refresh", result.tokens.refreshToken, {httpOnly: true, secure: true})

      return result.user
  }

  @Get('logout') 
  @UseGuards(AccessTokenGuard)
  logout(@Res({ passthrough: true }) response: Response) {
      response.clearCookie('jwt')
      response.clearCookie('jwt-refresh')

      response.sendStatus(200)
  }

  @Get('refresh-token')
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@Req() req: Request, @GetUser() user: UserEntity, @Res({ passthrough: true }) response: Response) {
      const tokens = await this.authService.refreshToken(user.id, req.cookies['jwt-refresh'])

      response.cookie("jwt", tokens.accessToken, {httpOnly: true, secure: true})
      response.cookie("jwt-refresh", tokens.refreshToken, {httpOnly: true, secure: true})

      response.sendStatus(200)
  }
}
