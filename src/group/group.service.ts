import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryService } from 'src/category/category.service';
import { Group, User, Image } from '@prisma/client';
import { ImageService } from 'src/image/image.service';
import { GetOneGroupDto } from './dto/get-one-group.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
    private readonly imageService: ImageService
  ) {}

  async isSubscribed(groupId: number, userId: number) {
    await this.findOne(groupId)

    return await this.prisma.groupSub.findFirst({
      where: {userId, groupId}
    })
  }

  async subscribe(groupId: number, userId: number) {
    const isSub = await this.isSubscribed(groupId, userId)

    if (isSub) {
      throw new BadRequestException("You're already a sub of the groud")
    }

    await this.prisma.groupSub.create({
      data: {
        user: {connect: {id: userId}},
        group: {connect: {id: groupId}}
      }
    })
  }

  async unsubscribe(groupId: number, userId: number) {
    const isSub = await this.isSubscribed(groupId, userId)

    if (!isSub) {
      throw new BadRequestException("You're not a sub of the groud")
    }

    await this.prisma.groupSub.delete({
      where: {
        userId_groupId: {
          groupId, userId
        }
      }
    })
  }

  async create(createGroupDto: CreateGroupDto) {
    const {adminId, name, description, file, categories: categoryNames} = createGroupDto

    const categories = await this.categoryService.handleCategories(categoryNames, adminId)
    const images: Image[] = []

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    return await this.prisma.group.create({
      data: {
        name,
        description,
        admin: {connect: {id: adminId}},
        categories: {
          create: categories.map(cat => ({category: {connect: {id: cat.id}}}))
        }
      }
    })
  }

  async getAllGroups() {
    const groups = await this.prisma.group.findMany({
      include: {
        _count: {
          select: {
            subs: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        images: {
          include: {
            image: true
          }
        },
        admin: {
          include: {
            images: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })

    return groups.map(group => new GetOneGroupDto(group))
  }

  async findOne(id: number) {
    return await this.prisma.group.findFirstOrThrow({where: {id}})
  }

  async getOneGroup(id: number) {
    const group = await this.prisma.group.findFirstOrThrow({
      where: {id},
      include: {
        _count: {
          select: {
            subs: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        images: {
          include: {
            image: true
          }
        },
        admin: {
          include: {
            images: {
              include: {
                image: true
              }
            }
          }
        }
      }
    })

    return new GetOneGroupDto(group)
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    await this.findOne(id)

    const {adminId, name, description, file, categories: categoryNames} = updateGroupDto

    const categories = await this.categoryService.handleCategories(categoryNames, adminId)
    const images: Image[] = []

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    return await this.prisma.group.update({
      where: {id},
      data: {
        name,
        description,
        categories: {
          create: categories.map(cat => ({category: {connect: {id: cat.id}}}))
        }
      }
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.prisma.group.delete({where: {id}})
  }
}
