import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { CommonConfig } from 'src/config/configuration.types';

@Injectable()
export class MailService {
    private readonly hostName: string

    constructor(
        private configService: ConfigService,
        private mailer: MailerService
    ) {
        this.hostName = this.configService.get<CommonConfig>('common').host
    }

    async sendConfirmation(user, token: string) {
        const url = `${this.hostName}/auth/confirm?token=${token}`

        await this.mailer.sendMail({
            to: user.email,
            subject: "Welcome to Social Network! Confirm your Email",
            template: join(__dirname, '/../mail/templates', 'confirmation'),
            context: {
                username: user.username,
                url
            },
        })
    }
}
