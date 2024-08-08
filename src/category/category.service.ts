import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { UpdateTagDto } from 'src/tag/dto/update-tag.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class CategoryService {
  private readonly categoryRepository: Repository<Category>
  
  constructor(
    private dataSource: DataSource
  ) {
    this.categoryRepository = this.dataSource.getRepository(Category)
  }

  async handleCategories(categoryNames: string[], user: User) {
    const categories: Category[] = []

    for (let categoryName of categoryNames) {
      let category = await this.findByName(categoryName)

      if (!category) {
        category = await this.create({name: categoryName, user})
      }

      categories.push(category)
    }

    return categories
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const tag = this.categoryRepository.create({
      ...createCategoryDto,
      owner: createCategoryDto.user
    })

    return await this.categoryRepository.save(tag)
  }

  async findAll() {
    return await this.categoryRepository.find()
  }

  async findByName(name: string) {
    const category = await this.categoryRepository.findOne({where: {name}})

    return category
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({where: {id}})

    if (!category) {
      throw new BadRequestException("Category not found!")
    }

    return category
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id)
    const categoryMerged = this.categoryRepository.merge(category, updateCategoryDto)
    const categoryUpdated = await this.categoryRepository.save(categoryMerged)

    return categoryUpdated
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.categoryRepository.delete(id);
  }
}
