import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource, Repository } from 'typeorm';
import { GroupService } from 'src/group/group.service';
import { Post } from './entities/post.entity';
import { TagService } from 'src/tag/tag.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class PostService {
  private readonly postRepository: Repository<Post>
  
  constructor(
    private dataSource: DataSource,
    private readonly groupService: GroupService,
    private readonly tagService: TagService,
    private readonly imageService: ImageService
  ) {
    this.postRepository = this.dataSource.getRepository(Post)
  }

  async create(createPostDto: CreatePostDto) {
    const {text, groupId, publisher, tags: tagNames, files} = createPostDto

    const group = await this.groupService.findOne(groupId)
    const tags = await this.tagService.handleTags(tagNames, publisher)

    const postPlain = this.postRepository.create({text, group, publisher, tags}) 

    if (files) {
      const images = await this.imageService.uploadManyImages(files)

      postPlain.images = images
    }

    return await this.postRepository.save(postPlain)
  }

  async findAll() {
    return await this.postRepository.find()
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: {id}, 
      relations: {
        tags: true,
        views: true
      },
      select: {
        views: {
          id: true
        }
      }
    })
    
    if (!post) {
      throw new NotFoundException("Post not found!")
    }

    return {...post, viewsAmount: post.views.length}
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const {text, publisher, tags: tagNames, files} = updatePostDto
    const post = await this.findOne(id)
  
    if (files) {
      const images = await this.imageService.uploadManyImages(files)

      post.images = [...post.images, ...images]
    }

    if (tagNames && tagNames.length) {
      const tags = await this.tagService.handleTags(tagNames, publisher)

      post.tags = [...post.tags, ...tags]
    }

    post.text = text

    return await this.postRepository.save(post)
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.postRepository.delete(id)
  }

  async getGroupPosts(id: number) {
    await this.groupService.findOne(id)
    
    return await this.postRepository.find({where: {group: {id}}})
  }
}
