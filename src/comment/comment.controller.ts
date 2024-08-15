import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { User } from '@prisma/client';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { CommentTreeDto } from './dto/comment-tree.dto';
import { GetCommentDto } from './dto/get-comment.dto';

@ApiTags('Comment')
@Controller('/')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Put('/comments/:id/upvote')

  @ApiOkResponse({description: "Comment upvoted"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @UseGuards(AccessTokenGuard)

  upvoteComment(@Param('id') id: string, @GetUser() user: User) {
    const voteCommentDto = new VoteCommentDto(+id, user.id, 1)

    return this.commentService.vote(voteCommentDto);
  }

  @Put('/comments/:id/downvote')

  @ApiOkResponse({description: "Comment downvoted"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @UseGuards(AccessTokenGuard)
  downwoteComment(@Param('id') id: string, @GetUser() user: User) {
    const voteCommentDto = new VoteCommentDto(+id, user.id, -1)

    return this.commentService.vote(voteCommentDto);
  }

  @Post('posts/:postId/comments')

  @ApiOkResponse({description: "Comment added", type: GetCommentDto})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiNotFoundResponse({description: "Post not found"})

  @UseGuards(AccessTokenGuard)

  async addPostComment(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    createCommentDto.postId = +postId
    createCommentDto.commenterId = user.id
    
    const comment = await this.commentService.create(createCommentDto)

    return new GetCommentDto(comment)
  }

  @Get('posts/:postId/comments')

  @ApiOkResponse({type: [CommentTreeDto]})
  @ApiNotFoundResponse({description: "Post not found"})

  getPostComments(@Param('postId') postId: string) {
    return this.commentService.getPostComments(+postId);
  }

  @Post('posts/:postId/comments/:commentId')

  @ApiOkResponse({description: "Comment replied", type: GetCommentDto})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiNotFoundResponse({description: "Comment or Post not found"})

  @UseGuards(AccessTokenGuard)

  async addReplyToComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    createCommentDto.postId = +postId
    createCommentDto.commenterId = user.id
    createCommentDto.commentId = +commentId
    
    const comment = await this.commentService.create(createCommentDto)

    return new GetCommentDto(comment)
  }

  @Patch('comments/:id')

  @ApiOkResponse({description: "Comment updated", type: GetCommentDto})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @UseGuards(AccessTokenGuard)
  
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentService.update(+id, updateCommentDto);

    return new GetCommentDto(comment)
  }

  @Delete('comments/:id')

  @ApiNotFoundResponse({description: "Comment not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiOkResponse({description: "Comment deleted"})

  @UseGuards(AccessTokenGuard)

  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
