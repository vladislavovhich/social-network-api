import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UploadedFile, UseGuards, UseInterceptors, Query, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Request, Response} from "express"
import { ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse, ApiExcludeEndpoint, ApiForbiddenResponse, ApiOkResponse, ApiProduces, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CheckVerified } from 'src/common/decorators/check-verified.decorator';
import { multerOptions } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileDto } from 'src/user/dto/user-profile.dto';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { PasswordChangeDto } from './dto/password-change.dto';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    @Get('confirm')
    @ApiExcludeEndpoint()
    async confirmEmail(@Query('token') token: string, @Res({ passthrough: true }) response: Response) { 
        await this.authService.confirmEmail(token)

        response.status(200).json({message: "Email is successfully confirmed"})
    }


    @Get('confirm-resend')

    @ApiOkResponse({description: "Email confirm is sent"})
    @ApiUnauthorizedResponse({description: "User not authorized"})
    @ApiBadRequestResponse({description: "User is already confirmed"})

    @UseGuards(AccessTokenGuard)
    @CheckVerified(false)

    async sendConfirmEmail(@GetUser() user: User) { 
        return await this.authService.sendConfirmationEmail(user)
    }


    @Get('change-password-send')

    @ApiOkResponse({description: "Password change email is sent"})
    @ApiUnauthorizedResponse({description: "User not authorized"})

    @UseGuards(AccessTokenGuard)

    async sendPasswordChangeEmail(@GetUser() user: User) {
        await this.authService.sendChangePasswordEmail(user)
    }


    @Put('change-password')

    @ApiOkResponse({description: "Password is successfully changed"})
    @ApiUnauthorizedResponse({description: "User not authorized"})
    @ApiBadRequestResponse({description: "Incorrect input data | Incorrect token"})

    @UseGuards(AccessTokenGuard)

    async changePassword(@GetUser() user: User, @Body() changePasswordDto: PasswordChangeDto) {
        changePasswordDto.user = user

        await this.authService.changePassword(changePasswordDto)
    }


    @Post('sign-in')

    @ApiCreatedResponse({type: UserProfileDto})
    @ApiBadRequestResponse({description: "Incorrect login or password | Incorrect input data"})

    async signIn(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) { 
        const result = await this.authService.signIn(loginDto)

        response.cookie("jwt", result.tokens.accessToken, {httpOnly: true, secure: true})
        response.cookie("jwt-refresh", result.tokens.refreshToken, {httpOnly: true, secure: true})

        return this.userService.findOneProfile(result.user.id)
    }


    @Post('sign-up') 

    @ApiCreatedResponse({type: UserProfileDto})
    @ApiBadRequestResponse({description: "Email is already taken | Incorrect input data"})

    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor('file', multerOptions))

    async signUp(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response: Response,  @UploadedFile() file: Express.Multer.File) {
        createUserDto.file = file

        const result = await this.authService.signUp(createUserDto)

        response.cookie("jwt", result.tokens.accessToken, {httpOnly: true, secure: true})
        response.cookie("jwt-refresh", result.tokens.refreshToken, {httpOnly: true, secure: true})

        return this.userService.findOneProfile(result.user.id)
    }

    
    @Get('log-out') 

    @ApiOkResponse({description: "User successfully logged out"})
    @ApiUnauthorizedResponse({description: "User not authorized"})

    @UseGuards(AccessTokenGuard)

    logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt')
        response.clearCookie('jwt-refresh')

        response.sendStatus(200)
    }


    @Get('refresh-token')

    @ApiOkResponse({description: "Tokens are refreshed"})
    @ApiUnauthorizedResponse({description: "User not authorized"})


    @UseGuards(RefreshTokenGuard)

    async refreshToken(@Req() req: Request, @GetUser() user: User, @Res({ passthrough: true }) response: Response) {
        const tokens = await this.authService.refreshToken(user.id, req.cookies['jwt-refresh'])

        response.cookie("jwt", tokens.accessToken, {httpOnly: true, secure: true})
        response.cookie("jwt-refresh", tokens.refreshToken, {httpOnly: true, secure: true})

        response.sendStatus(200)
    }
}
