import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DataSource, Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { ImageService } from 'src/image/image.service';
import { CategoryService } from 'src/category/category.service';
import { Image } from 'src/image/entities/image.entity';
import { User } from 'src/user/entities/user.entity';

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

  isSubscribed(group: Group, user: User) {
    return group.subscribers.some(subs => subs && subs.id == user.id)
  }

  async subscribe(groupId: number, user: User) {
    const group = await this.findOne(groupId)

    if (this.isSubscribed(group, user)) {
      throw new BadRequestException("You're already subscribed to group!")
    }

    group.subscribers.push(user)

    await this.groupRepository.save(group)

    return "Subscribed to group"
  }

  async unsubscribe(groupId: number, user: User) {
    const group = await this.findOne(groupId)

    if (!this.isSubscribed(group, user)) {
      throw new BadRequestException("You're not subscribed to group!")
    }

    group.subscribers = group.subscribers.filter(sub => sub.id != user.id)

    return "Unsubscribed to group"
  }

  async create(createGroupDto: CreateGroupDto) {
    const categories = await this.categoryService.handleCategories(createGroupDto.categories, createGroupDto.admin)

    const groupPlain = this.groupRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      admin: createGroupDto.admin,
      categories
    })
    const images: Image[] = []

    if (createGroupDto.file) {
      const image = await this.imageService.uploadImage(createGroupDto.file)

      images.push(image)
    }

    groupPlain.images = images

    const group = await this.groupRepository.save(groupPlain)

    return await this.findOne(group.id)
  }

  async findAll() {
    return this.groupRepository.find()
  }

  async findOne(id: number) {
    const groupRaw = await this.groupRepository
      .createQueryBuilder("group")
      .leftJoin("group.subscribers", "subs")
      .leftJoin("group.images", "images")
      .leftJoin("group.admin", "admin")
      .leftJoin("admin.images", "adminImages")
      .leftJoin("group.categories", "categories")
      .where("group.id = :id", {id})
      .select([
        "group.id", "group.name", "group.description", "group.created_at",
        "images.id", "images.url", 
        "adminImages.id", "adminImages.url", "admin.id", "admin.username",
        "categories.id", "categories.name", "COUNT(subs) as totalSubs"
      ])
      .groupBy("group.id")
      .addGroupBy("admin.id")
      .addGroupBy("categories.id")
      .addGroupBy("images.id")
      .addGroupBy("adminImages.id")
      .getRawAndEntities()
    
    const group = groupRaw.entities[0]

    group.totalSubs = +groupRaw.raw[0].totalsubs

    if (!group) {
      throw new NotFoundException("Group not found!")
    }

    return group
  }


  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id)
    
    if (updateGroupDto.file) {
      const image = await this.imageService.uploadImage(updateGroupDto.file)

      group.images.push(image)
    }

    if (updateGroupDto.categories) {
      const categories = await this.categoryService.handleCategories(updateGroupDto.categories, group.admin)

      group.categories = [...group.categories, ...categories]
    }

    await this.groupRepository.save(group)

    return this.findOne(id)
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.groupRepository.delete(id)

    return "Group deleted"
  }
}
