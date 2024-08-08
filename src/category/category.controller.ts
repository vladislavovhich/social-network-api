import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CheckOwnership } from 'src/common/decorators/check-ownership.decorator';
import { OwnershipGuard } from 'src/common/guards/check-ownership.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    createCategoryDto.user = user

    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @CheckOwnership('Category', 'owner')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @CheckOwnership('Category', 'owner')
  @UseGuards(OwnershipGuard)
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
