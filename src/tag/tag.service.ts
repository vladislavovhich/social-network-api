import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Tag } from '@prisma/client';

@Injectable()
export class TagService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async handleTags(tagNames: string[], userId: number) {
    const tags: Tag[] = []

    if (!tagNames) {
      return []
    }

    for (let tagName of tagNames) {
      let tag = await this.findByName(tagName)

      if (!tag) {
        tag = await this.create({name: tagName, userId})
      }

      tags.push(tag)
    }

    return tags
  }

  async create(createTagDto: CreateTagDto) {
    const {name, userId} = createTagDto

    return await this.prisma.tag.create({
      data: {
        name,
        owner: { connect: {id: userId}}
      }
    })
  }

  async findAll() {
    return await this.prisma.tag.findMany()
  }

  async findByName(name: string) {
    return await this.prisma.tag.findFirst({where: {name}})
  }

  async findOne(id: number) {
    return await this.prisma.tag.findFirstOrThrow({where: {id}})
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    return await this.prisma.tag.update({
      where: {id},
      data: {
        name: updateTagDto.name
      }
    })
  }

  async remove(id: number) {
    return await this.prisma.tag.delete({where: {id}})
  }
}
