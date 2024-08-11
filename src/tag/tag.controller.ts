import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { User } from '@prisma/client';

@ApiExcludeController()
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(@Body() createTagDto: CreateTagDto, @GetUser() user: User) {
    createTagDto.userId = user.id

    return this.tagService.create(createTagDto);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
