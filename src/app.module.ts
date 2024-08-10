import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeormModule } from './typeorm/typeorm.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { MailConfig } from './config/configuration.types';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { ImageModule } from './image/image.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TagModule } from './tag/tag.module';
import { CategoryModule } from './category/category.module';
import { PostModule } from './post/post.module';
import { GroupModule } from './group/group.module';
import { ViewModule } from './view/view.module';
import { VoteModule } from './vote/vote.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }), 
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mailConfig = configService.get<MailConfig>('mail')

        return {
          transport: {
            host: mailConfig.host,
            port: mailConfig.port,
            auth: {
              user: mailConfig.user,
              pass: mailConfig.password,
            },
          },
          template: {
            adapter: new HandlebarsAdapter(), 
            options: {
              strict: true,
            },
          },
        }
      }
    }),
    TypeormModule, 
    UserModule, 
    AuthModule, 
    MailModule, 
    ImageModule, 
    CloudinaryModule, 
    TagModule, 
    CategoryModule, 
    PostModule, 
    GroupModule, 
    ViewModule, VoteModule, CommentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
