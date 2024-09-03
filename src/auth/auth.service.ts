import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt"
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/configuration.types';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';
import { JwtEmail } from './auth.types';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cap from "svg-captcha"
import { PasswordChangeDto } from './dto/password-change.dto';

@Injectable()
export class AuthService {
    constructor (
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
        private readonly prisma: PrismaService
    ) {}
   
  
    async signUp(createUserDto: CreateUserDto) {
        const isExist = await this.userService.findByEmail(createUserDto.email)

        if (isExist) {
        throw new BadRequestException("Email is already taken!")
        }
        
        const password = await bcrypt.hash(createUserDto.password, 10)
        const user = await this.userService.create({...createUserDto, password})
        const tokens = this.createTokens(user.id)

        await this.updateToken(user.id, tokens.refreshToken)
        await this.sendConfirmationEmail(user)

        const profile = await this.userService.findOneProfile(user.id)

        return {user: profile, tokens}
    }

    async sendConfirmationEmail(user: User) {
        if (user.isVerified) {
            throw new BadRequestException("User is verified!")
        }

        const token = this.createToken({email: user.email}, 'confirm')

        await this.mailService.sendConfirmation(user, token)
    }

    async sendChangePasswordEmail(user: User) {
        const token = this.createToken({email: user.email}, 'passwordChange')

        await this.mailService.sendPasswordChange(user, token)
    }

    async changePassword(changePasswordDto: PasswordChangeDto) {
        const {user, token, password: pass} = changePasswordDto

        try {
            const payload: JwtEmail = await this.jwtService.verify(token, {
                secret: this.configService.get<JwtConfig>('passport').passwordChange.secret
            }) 


            if (!payload) {
                throw new BadRequestException("Something went wrong.")
            }

            const password = await bcrypt.hash(pass, 10)

            await this.userService.updatePassword(user.id, password)
        } catch (error: any) {
            if (error instanceof TokenExpiredError) {
                throw new BadRequestException("Password change token is expired, you can send a new one.")
            }

            throw new BadRequestException("Can't change your password.")
        }
    }

    async confirmEmail(token: string) {
        try {
            const payload: JwtEmail = await this.jwtService.verify(token, {
                secret: this.configService.get<JwtConfig>('passport').confirm.secret
            })

            if (!payload) {
                throw new BadRequestException("Something went wrong.")
            }

            await this.userService.confirmEmail(payload.email)
        } catch (error: any) {
            if (error instanceof TokenExpiredError) {
                throw new BadRequestException("Email confirmation token is expired, you can send a new one.")
            }

            throw new BadRequestException("Can't confirm your email.")
        }
    }

    async signIn(loginUserDto: LoginDto) {
        const user = await this.userService.findByEmail(loginUserDto.email)

        if (!user) {
            throw new BadRequestException("Incorrect login or password.")
        }

        const passwordVerify = await bcrypt.compare(loginUserDto.password, user.password)

        if (!passwordVerify) {
            throw new BadRequestException("Incorrect login or password.")
        }

        const tokens = this.createTokens(user.id)

        await this.updateToken(user.id, tokens.refreshToken)

        const profile = await this.userService.findOneProfile(user.id)

        return {tokens, user: profile}
    }

    async refreshToken(userId: number, refreshToken: string) {
        try {
            this.jwtService.verify(refreshToken, {secret: process.env.JWT_REFRESH_SECRET})

            const tokens = this.createTokens(userId)

            await this.updateToken(userId, tokens.refreshToken)

            return tokens
        } catch (error) {
            throw new BadRequestException(error)
        }
    }

    async updateToken(userId: number, token: string) {
        await this.userService.updateToken(userId, token)
    }

    createToken(signIn: any, config: 'access' | 'refresh' | 'confirm' | 'passwordChange') {
        const passportConfig = this.configService.get<JwtConfig>('passport')

        return this.jwtService.sign(signIn, {secret: passportConfig[config].secret, expiresIn: passportConfig[config].expire})
    }

    createTokens(userId: number) {
        return {
            accessToken: this.createToken({userId}, 'access'),
            refreshToken: this.createToken({userId}, 'refresh')
        }
    }
}
