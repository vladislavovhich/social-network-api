import { forwardRef, Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  controllers: [],
  providers: [ViewService],
  imports: [UserModule, forwardRef(() => PostModule)],
  exports: [ViewService]
})
export class ViewModule {}
