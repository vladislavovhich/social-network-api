import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';

@ApiTags('Comment')
@Controller('/')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Put('/comments/:id/upvote')
  @UseGuards(AccessTokenGuard)
  upvoteComment(@Param('id') id: string, @GetUser() user: User) {
    return this.commentService.vote(+id, user, 1);
  }

  @Put('/comments/:id/downvote')
  @UseGuards(AccessTokenGuard)
  downwoteComment(@Param('id') id: string, @GetUser() user: User) {
    return this.commentService.vote(+id, user, -1);
  }

  @Post('posts/:postId/comments')
  @UseGuards(AccessTokenGuard)
  addPostComment(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    createCommentDto.postId = +postId
    createCommentDto.commenter = user
    
    return this.commentService.create(createCommentDto)
  }

  @Get('posts/:postId/comments')
  findAll(@Param('postId') postId: string) {
    return this.commentService.findAll(+postId);
  }

  @Post('posts/:postId/comments/:commentId')
  @UseGuards(AccessTokenGuard)
  addReplyToComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    createCommentDto.postId = +postId
    createCommentDto.commenter = user
    createCommentDto.commentId = +commentId
    
    return this.commentService.create(createCommentDto)
  }

  @Patch('comments/:id')
  @CheckOwnership('Comment', 'commenter')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete('comments/:id')
  @CheckOwnership('Comment', 'commenter')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
