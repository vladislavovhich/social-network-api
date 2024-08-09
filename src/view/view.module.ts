import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { ViewController } from './view.controller';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [ViewController],
  providers: [ViewService],
  imports: [UserModule, PostModule]
})
export class ViewModule {}
