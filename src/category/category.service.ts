import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async handleCategories(categoryNames: string[], userId: number) {
    const categories: Category[] = []

    for (let categoryName of categoryNames) {
      let category = await this.findByName(categoryName)

      if (!category) {
        category = await this.create({name: categoryName, userId})
      }

      categories.push(category)
    }

    return categories
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const {name, userId} = createCategoryDto

    return await this.prisma.category.create({
      data: {
        name,
        owner: { connect: {id: userId}}
      }
    })
  }

  async findAll() {
    return await this.prisma.category.findMany()
  }

  async findByName(name: string) {
    return await this.prisma.category.findFirst({where: {name}})
  }

  async findOne(id: number) {
    return await this.prisma.category.findFirstOrThrow({where: {id}})
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return await this.prisma.category.update({
      where: {id},
      data: {
        name: updateCategoryDto.name
      }
    })
  }

  async remove(id: number) {
    return await this.prisma.category.delete({where: {id}})
  }
}
