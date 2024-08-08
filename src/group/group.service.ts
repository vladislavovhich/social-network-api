import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DataSource, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { ImageService } from 'src/image/image.service';
import { CategoryService } from 'src/category/category.service';
import { Image } from 'src/image/entities/image.entity';

@Injectable()
export class GroupService {
  private readonly groupRepository: Repository<Group>

  constructor(
    private dataSource: DataSource,
    private readonly imageService: ImageService,
    private readonly categoryService: CategoryService
  ) {
    this.groupRepository = this.dataSource.getRepository(Group)
  }

  async create(createGroupDto: CreateGroupDto) {
    const categories = await this.categoryService.handleCategories(createGroupDto.categories, createGroupDto.admin)

    const groupPlain = this.groupRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      admin: createGroupDto.admin,
      categories
    })
    const group = await this.groupRepository.save(groupPlain)

    if (createGroupDto.file) {
      const image = await this.imageService.uploadImage(group, createGroupDto.file)

      return {...group, pfp: image, images: []}
    }

    return group
  }

  async findAll() {
    return this.groupRepository.find()
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({where: {id}})

    if (!group) {
      throw new NotFoundException("Category not found!")
    }

    const images = await this.findImages(group)

    return {...group, pfp: images.length ? images.at(-1) : null, images}
  }

  async findImages(group: Group) {
    const images = await this.imageService.getImages(group)

    return images
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id)

    if (updateGroupDto.file) {
      const image = await this.imageService.uploadImage(group, updateGroupDto.file)

      return {...group, pfp: image, images: [...group.images, image]}
    }

    return group
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.groupRepository.delete(id)
  }
}
