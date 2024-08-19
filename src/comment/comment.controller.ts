import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, ParseIntPipe, Res } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { User } from '@prisma/client';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { CommentTreeDto } from './dto/comment-tree.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { ItemId } from 'src/common/decorators/item-id.decorator';
import { PassOnly } from 'src/group/decorators/pass-type.decorator';
import { UserPassEnum } from 'src/group/group.types';
import { Response } from 'express';
import { PassUserCommentGuard } from './guards/pass-user-comment.guard';
import { PassUserPostGuard } from 'src/post/guards/pass-user-post.guard';
import { CheckOwnership } from 'src/post/decorators/check-ownership.decorator';

@ApiTags('Comment')
@Controller('/')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Put('/comments/:id/upvote')

  @ApiOkResponse({description: "Comment upvoted"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @UseGuards(PassUserCommentGuard)
  @UseGuards(AccessTokenGuard)

  async upvoteComment(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Res() res: Response
  ) {
    const voteCommentDto = new VoteCommentDto(id, user.id, 1)

    await this.commentService.vote(voteCommentDto);

    res.sendStatus(200)
  }


  @Put('/comments/:id/downvote')

  @ApiOkResponse({description: "Comment downvoted"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @UseGuards(PassUserCommentGuard)
  @UseGuards(AccessTokenGuard)

  async downwoteComment(
    @Param('id', ParseIntPipe) id: number, 
    @GetUser() user: User,
    @Res() res: Response
  ) {
    const voteCommentDto = new VoteCommentDto(+id, user.id, -1)

    await this.commentService.vote(voteCommentDto);

    res.sendStatus(200)
  }


  @Post('/posts/:postId/comments')

  @ApiCreatedResponse({description: "Comment added", type: GetCommentDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Post not found"})

  @ItemId("postId")
  @UseGuards(PassUserPostGuard)
  @UseGuards(AccessTokenGuard)

  async addPostComment(
    @Param('postId', ParseIntPipe) postId: number, 
    @Body() createCommentDto: CreateCommentDto, 
    @GetUser() user: User
  ) {
    createCommentDto.postId = postId
    createCommentDto.commenterId = user.id
    
    const comment = await this.commentService.create(createCommentDto)

    return new GetCommentDto(comment)
  }

  
  @Get('/posts/:postId/comments')

  @ApiOkResponse({type: [CommentTreeDto]})
  @ApiBadGatewayResponse({description: "Incorrect input data"})
  @ApiNotFoundResponse({description: "Post not found"})

  getPostComments(
    @Param('postId', ParseIntPipe) postId: number
  ) {
    return this.commentService.getPostComments(postId);
  }


  @Post('/posts/:postId/comments/:commentId')

  @ApiOkResponse({description: "Comment replied", type: GetCommentDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Comment or Post not found"})

  @ItemId("commentId")
  @UseGuards(PassUserCommentGuard)
  @UseGuards(AccessTokenGuard)

  async addReplyToComment(
    @Param('postId', ParseIntPipe) postId: number, 
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() createCommentDto: CreateCommentDto, 
    @GetUser() user: User
  ) {
    createCommentDto.postId = postId
    createCommentDto.commenterId = user.id
    createCommentDto.commentId = commentId
    
    const comment = await this.commentService.create(createCommentDto)

    return new GetCommentDto(comment)
  }

  @Patch('/comments/:id')

  @ApiOkResponse({description: "Comment updated", type: GetCommentDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Comment not found"})

  @CheckOwnership(true)
  @UseGuards(PassUserCommentGuard)
  @UseGuards(AccessTokenGuard)
  
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const comment = await this.commentService.update(id, updateCommentDto);

    return new GetCommentDto(comment)
  }

  @Delete('comments/:id')

  @ApiNotFoundResponse({description: "Comment not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiOkResponse({description: "Comment deleted"})

  @CheckOwnership(true)
  @PassOnly(UserPassEnum.AdminAndModerators)
  @UseGuards(PassUserCommentGuard)
  @UseGuards(AccessTokenGuard)

  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    await this.commentService.remove(+id);

    res.sendStatus(200)
  }
}
