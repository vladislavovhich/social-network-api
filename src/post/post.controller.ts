import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, forwardRef, Inject } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBadRequestResponse, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { ViewService } from 'src/view/view.service';
import { GetPostDto } from './dto/get-post.dto';
import { User } from '@prisma/client';
import { VotePostDto } from './dto/vote-post.dto';
import { ViewOperationDto } from 'src/view/dto/view-operation.dto';

@ApiTags("Post")
@Controller('/')
export class PostController {
  constructor(
    private readonly postService: PostService,
    @Inject(forwardRef(() => ViewService))
    private readonly viewService: ViewService
  ) {}

  @Post('/groups/:id/posts')

  @ApiOkResponse({type: GetPostDto, description: "Created post"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiConsumes("multipart/form-data")

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))

  create(@Param('id') id: string, @Body() createPostDto: CreatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    createPostDto.groupId = +id
    createPostDto.publisherId = user.id
    createPostDto.files = files

    return this.postService.create(createPostDto);
  }

  @Get('/groups/:id/posts')

  @ApiOkResponse({type: [GetPostDto]})
  @ApiNotFoundResponse({description: "Group not found"})

  getGroupPosts(@Param('id') id: string) {
    return this.postService.getGroupPosts(+id)
  }

  @Get('/posts/:id')

  @ApiOkResponse({type: GetPostDto, description: "Post"})
  @ApiNotFoundResponse({description: "Post not found"})

  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
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

  @ApiOkResponse({type: GetPostDto, description: "Viewed Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})

  @UseGuards(AccessTokenGuard)

  markPostAsViewed(@Param('id') id: string, @GetUser() user: User) {
    const viewDto = new ViewOperationDto(user.id, +id)

    return this.viewService.markPostAsViewed(viewDto);
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

  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    updatePostDto.publisherId = user.id
    updatePostDto.files = files

    return this.postService.update(+id, updatePostDto);
  }

  @Delete('/posts/:id')

  @ApiOkResponse({description: "Post deleted"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiResponse({status: 403, description: "Access denied (Resource does not belong to the user)"})

  @UseGuards(AccessTokenGuard)
  
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
