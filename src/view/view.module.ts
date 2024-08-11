import { forwardRef, Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [ViewService],
  imports: [PrismaModule],
  exports: [ViewService]
})
export class ViewModule {}
