import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { GroupModule } from 'src/group/group.module';
import { ImageModule } from 'src/image/image.module';
import { TagModule } from 'src/tag/tag.module';
import { VoteModule } from 'src/vote/vote.module';
import { ViewModule } from 'src/view/view.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BanModule } from 'src/ban/ban.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [GroupModule, ImageModule, TagModule, VoteModule, PrismaModule, ViewModule, BanModule],
  exports: [PostService] 
})
export class PostModule {}
