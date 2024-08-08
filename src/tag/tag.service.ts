import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { DataSource, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TagService {
  private readonly tagRepository: Repository<Tag>
  
  constructor(
    private dataSource: DataSource
  ) {
    this.tagRepository = this.dataSource.getRepository(Tag)
  }

  async handleTags(tagNames: string[], user: User) {
    const tags: Tag[] = []

    for (let tagName of tagNames) {
      let tag = await this.findByName(tagName)

      if (!tag) {
        tag = await this.create({name: tagName, user})
      }

      tags.push(tag)
    }

    return tags
  }

  async create(createTagDto: CreateTagDto) {
    const tag = this.tagRepository.create({
      ...createTagDto,
      owner: createTagDto.user
    })

    return await this.tagRepository.save(tag)
  }

  async findAll() {
    return await this.tagRepository.find()
  }

  async findByName(name: string) {
    const tag = await this.tagRepository.findOne({where: {name}})

    return tag
  }

  async findOne(id: number) {
    const tag = await this.tagRepository.findOne({where: {id}})

    if (!tag) {
      throw new BadRequestException("Tag not found!")
    }

    return tag
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id)
    const tagMerged = this.tagRepository.merge(tag, updateTagDto)
    const tagUpdated = await this.tagRepository.save(tagMerged)

    return tagUpdated
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.tagRepository.delete(id);
  }
}
