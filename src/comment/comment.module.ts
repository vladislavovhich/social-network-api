import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { VoteModule } from 'src/vote/vote.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
  imports: [PostModule, VoteModule]
})
export class CommentModule {}
