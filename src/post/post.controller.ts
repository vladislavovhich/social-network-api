import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, forwardRef, Inject, Res, Query, ParseIntPipe } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBadRequestResponse, ApiConsumes, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
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
import { PostPaginationResponseDto } from './dto/post-pagination-response.dto';
import { PostPaginationDto } from './dto/post-pagination.dto';
import { IsPostPublished } from './decorators/post-published.decorator';
import { PostPublishedGuard } from './guards/post-published.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GroupId } from 'src/group/decorators/group-id.decorator';
import { PassUserGuard } from 'src/group/guards/pass-user.guard';
import { PassOnly } from 'src/group/decorators/pass-type.decorator';
import { UserPassEnum } from 'src/group/group.types';

@ApiTags("Post")
@Controller('/')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly viewService: ViewService
  ) {}
  

  @Get('/users/feed')

  @ApiOkResponse({type: PostPaginationResponseDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @UseGuards(AccessTokenGuard)

  getFeedPosts(@GetUser() user: User, @Query() paginationDto: PostPaginationDto) {
    return this.postService.getFeedPosts(user.id, paginationDto)
  }


  @Post('/groups/:id/posts')

  @ApiOkResponse({type: GetPostDto, description: "Created post"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiConsumes("multipart/form-data")

  @GroupId("id")
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))

  async create(
    @Param('id', ParseIntPipe) id: number, 
    @Body() createPostDto: CreatePostDto, 
    @GetUser() user: User, 
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    createPostDto.groupId = id
    createPostDto.publisherId = user.id
    createPostDto.files = files

    const post = await this.postService.create(createPostDto);

    return this.postService.getGroupPost(post.id)
  }


  @Get('/groups/:id/posts-not-published')

  @ApiOkResponse({type: PostPaginationResponseDto})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiNotFoundResponse({description: "Group not found"})

  @GroupId("id")
  @PassOnly(UserPassEnum.AdminAndModerators)
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  getNotPublishedPosts(
    @Param('id', ParseIntPipe) id: number, 
    @Query() paginationDto: PaginationDto
  ) {
    return this.postService.getNotPublishedPosts(id, paginationDto)
  }


  @Get('/groups/:id/posts')

  @ApiOkResponse({type: PostPaginationResponseDto})
  @ApiNotFoundResponse({description: "Group not found"})

  getGroupPosts(@Param('id') id: string, @Query() paginationDto: PostPaginationDto) {
    return this.postService.getGroupPosts(+id, paginationDto)
  }


  @Get('/posts/:id')

  @ApiOkResponse({type: GetPostDto, description: "Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiBadRequestResponse({description: "Post isn't published yet"})

  @IsPostPublished("id")
  @UseGuards(PostPublishedGuard)

  findOne(@Param('id') id: string) {
    return this.postService.getGroupPost(+id);
  }


  @Get('/groups/:groupId/posts/:id/publish')

  @ApiOkResponse({type: GetPostDto, description: "Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiBadRequestResponse({description: "Post is already published | Incorrect input"})
  @ApiForbiddenResponse({description: "Access denied"})

  @GroupId("groupId")
  @PassOnly(UserPassEnum.AdminAndModerators)
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  publishPost(@Param('id', ParseIntPipe) id: number, @Param('groupId', ParseIntPipe) groupId: number) {
    return this.postService.publishPost(id);
  }


  @Put('/groups/:groupId/posts/:id/upvote')

  @ApiOkResponse({type: GetPostDto, description: "Upvoted Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiBadRequestResponse({description: "Post is already published | Incorrect input"})

  @IsPostPublished("id")
  @UseGuards(PostPublishedGuard)

  @GroupId("groupId")
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  upvotePost(
    @Param('id', ParseIntPipe) id: number, 
    @GetUser() user: User,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    const voteDto = new VotePostDto(+id, user.id, 1)

    return this.postService.vote(voteDto);
  }


  @Put('/groups/:groupId/posts/:id/downvote')

  @ApiOkResponse({type: GetPostDto, description: "Downvoted Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiForbiddenResponse({description: "Access denied"})

  @IsPostPublished("id")
  @UseGuards(PostPublishedGuard)

  @GroupId("groupId")
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  donwvotePost(
    @Param('id', ParseIntPipe) id: string, 
    @GetUser() user: User,
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    const voteDto = new VotePostDto(+id, user.id, -1)

    return this.postService.vote(voteDto);
  }


  @Post('/posts/:id/view')

  @ApiOkResponse({description: "Post marked as viewed"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @IsPostPublished("id")
  @UseGuards(PostPublishedGuard)

  @UseGuards(AccessTokenGuard)

  markPostAsViewed(@Param('id') id: string, @GetUser() user: User, @Res() response: Response) {
    const viewDto = new ViewOperationDto(user.id, +id)

    this.viewService.markPostAsViewed(viewDto);

    response.sendStatus(200)
  }


  @Patch('/groups/:groupId/posts/:id')
  
  @ApiOkResponse({type: GetPostDto, description: "Updated Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiConsumes("multipart/form-data")

  @IsPostPublished("id")
  @UseGuards(PostPublishedGuard)

  @GroupId("groupId")
  @UseGuards(PassUserGuard)
  @UseGuards(PostPublishedGuard)
  @UseGuards(AccessTokenGuard)

  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))

  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePostDto: UpdatePostDto, 
    @GetUser() user: User, 
    @UploadedFiles() files: Express.Multer.File[],
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    updatePostDto.publisherId = user.id
    updatePostDto.files = files

    await this.postService.update(+id, updatePostDto);

    return this.postService.getGroupPost(+id)
  }


  @Delete('/groups/:groupId/posts/:id')

  @ApiOkResponse({description: "Post deleted"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiForbiddenResponse({description: "Access denied"})
  @ApiUnauthorizedResponse({description: "Not authorized"})

  @GroupId("groupId")
  @PassOnly(UserPassEnum.AdminAndModerators)
  @UseGuards(PassUserGuard)

  @UseGuards(AccessTokenGuard)
  
  async remove(
    @Param('id', ParseIntPipe) id: number, 
    @Param('groupId', ParseIntPipe) groupId: number,
    @Res() response: Response
  ) {
    await this.postService.remove(id);

    response.sendStatus(200)
  }
}
