import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, forwardRef, Inject } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBadRequestResponse, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';
import { SubscriberGuard } from './guards/is-subscriber.guard';
import { ViewService } from 'src/view/view.service';
import { CreateViewDto } from 'src/view/dto/create-view.dto';
import { GetPostDto } from './dto/get-post.dto';

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
  @UseGuards(SubscriberGuard)
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  create(@Param('id') id: string, @Body() createPostDto: CreatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    createPostDto.groupId = +id
    createPostDto.publisher = user
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
    return this.postService.vote(+id, user, 1);
  }

  @Put('/posts/:id/downvote')
  @ApiOkResponse({type: GetPostDto, description: "Downvoted Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @UseGuards(AccessTokenGuard)
  donwvotePost(@Param('id') id: string, @GetUser() user: User) {
    return this.postService.vote(+id, user, -1);
  }

  @Post('/posts/:id/view')
  @ApiOkResponse({type: GetPostDto, description: "Viewed Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @UseGuards(AccessTokenGuard)
  markPostAsViewed(@Param('id') id: string, @GetUser() user: User) {
    return this.viewService.markPostAsViewed(new CreateViewDto(user.id, +id));
  }

  @Patch('/posts/:id')
  @ApiOkResponse({type: GetPostDto, description: "Updated Post"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 403, description: "Access denied (Resource does not belong to the user)"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiConsumes("multipart/form-data")
  @CheckOwnership('Post', 'publisher')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    updatePostDto.publisher = user
    updatePostDto.files = files

    return this.postService.update(+id, updatePostDto);
  }

  @Delete('/posts/:id')
  @ApiOkResponse({description: "Post deleted"})
  @ApiNotFoundResponse({description: "Post not found"})
  @ApiResponse({status: 401, description: "Not authorized"})
  @ApiResponse({status: 403, description: "Access denied (Resource does not belong to the user)"})
  @CheckOwnership('Post', 'publisher')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
