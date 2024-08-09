import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { GroupModule } from 'src/group/group.module';
import { ImageModule } from 'src/image/image.module';
import { TagModule } from 'src/tag/tag.module';
import { VoteModule } from 'src/vote/vote.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [GroupModule, ImageModule, TagModule, VoteModule],
  exports: [PostService]
})
export class PostModule {}
