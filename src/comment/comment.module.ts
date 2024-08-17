import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { VoteModule } from 'src/vote/vote.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { BanModule } from 'src/ban/ban.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
  imports: [PostModule, VoteModule, PrismaModule, GroupModule, BanModule]
})
export class CommentModule {}
