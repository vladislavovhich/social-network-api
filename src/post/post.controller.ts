import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { multerOptions } from 'src/config/multer.config';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';

@ApiTags("Post")
@Controller('/')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/groups/:id/posts')
  @ApiConsumes("multipart/form-data")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  create(@Param('id') id: string, @Body() createPostDto: CreatePostDto, @GetUser() user: User, @UploadedFiles() files: Express.Multer.File[]) {
    createPostDto.groupId = +id
    createPostDto.publisher = user
    createPostDto.files = files

    return this.postService.create(createPostDto);
  }

  @Get('/posts')
  findAll() {
    return this.postService.findAll();
  }

  @Get('/posts/:id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch('/posts/:id')
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
  @CheckOwnership('Post', 'publisher')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
