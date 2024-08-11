import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { VoteModule } from 'src/vote/vote.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
  imports: [PostModule, VoteModule, PrismaModule]
})
export class CommentModule {}
