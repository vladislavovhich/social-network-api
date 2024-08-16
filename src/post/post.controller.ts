import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, forwardRef, Inject, Res, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBadRequestResponse, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { ViewService } from 'src/view/view.service';
import { GetPostDto } from './dto/get-post.dto';
import { User } from '@prisma/client';
import { VotePostDto } from './dto/vote-post.dto';
import { ViewOperationDto } from 'src/view/dto/view-operation.dto';
import { Response } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostPaginationResponseDto } from './dto/post-pagination-response.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';

@ApiTags("Post")
@Controller('/')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly viewService: ViewService
  ) {}
  

  @Get('/users/feed')

  @ApiOkResponse({type: PostPaginationResponseDto})

  @UseGuards(AccessTokenGuard)

  getFeedPosts(@GetUser() user: User, @Query() paginationDto: PostPaginationDto) {
    return this.postService.getFeedPosts(user.id, paginationDto)
  }


  @Post('/groups/:id/posts')

  @ApiOkResponse({type: GetPostDto, description: "Created post"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiConsumes("multipart/form-data")

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))

  async create(@Param('id') id: string, @Body() createPostDto: CreatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    createPostDto.groupId = +id
    createPostDto.publisherId = user.id
    createPostDto.files = files

    const post = await this.postService.create(createPostDto);

    return this.postService.getGroupPost(post.id)
  }


  @Get('/groups/:id/posts')

  @ApiOkResponse({type: [GetPostDto]})
  @ApiNotFoundResponse({description: "Group not found"})

  getGroupPosts(@Param('id') id: string, @Query() paginationDto: PostPaginationDto) {
    return this.postService.getGroupPosts(+id, paginationDto)
  }

  @Get('/posts/:id')

  @ApiOkResponse({type: GetPostDto, description: "Post"})
  @ApiNotFoundResponse({description: "Post not found"})

  findOne(@Param('id') id: string) {
    return this.postService.getGroupPost(+id);
  }

  @Put('/posts/:id/upvote')

  @ApiOkResponse({type: GetPostDto, description: "Upvoted Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  upvotePost(@Param('id') id: string, @GetUser() user: User) {
    const voteDto = new VotePostDto(+id, user.id, 1)

    return this.postService.vote(voteDto);
  }

  @Put('/posts/:id/downvote')

  @ApiOkResponse({type: GetPostDto, description: "Downvoted Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  donwvotePost(@Param('id') id: string, @GetUser() user: User) {
    const voteDto = new VotePostDto(+id, user.id, -1)

    return this.postService.vote(voteDto);
  }

  @Post('/posts/:id/view')

  @ApiOkResponse({description: "Post marked as viewed"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  markPostAsViewed(@Param('id') id: string, @GetUser() user: User, @Res() response: Response) {
    const viewDto = new ViewOperationDto(user.id, +id)

    this.viewService.markPostAsViewed(viewDto);

    response.sendStatus(200)
  }

  @Patch('/posts/:id')
  
  @ApiOkResponse({type: GetPostDto, description: "Updated Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 403, description: "Access denied (Resource does not belong to the user)"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiConsumes("multipart/form-data")

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))

  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    updatePostDto.publisherId = user.id
    updatePostDto.files = files

    await this.postService.update(+id, updatePostDto);

    return this.postService.getGroupPost(+id)
  }

  @Delete('/posts/:id')

  @ApiOkResponse({description: "Post deleted"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiResponse({status: 403, description: "Access denied (Resource does not belong to the user)"})

  @UseGuards(AccessTokenGuard)
  
  async remove(@Param('id') id: string, @Res() response: Response) {
    await this.postService.remove(+id);

    response.sendStatus(200)
  }
}
