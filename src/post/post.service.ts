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
    const post = await this.postRepository.save(postPlain)

    if (files) {
      const images = await this.imageService.uploadManyImages(post, 'Post', files)

      return {...post, images}
    }

    return {...post, images: []} 
  }

  async findAll() {
    return await this.postRepository.find()
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({where: {id}, relations: {tags: true}})
  
    if (!post) {
      throw new NotFoundException("Post not found!")
    }

    const images = await this.imageService.getImages(post, 'Post')

    return {...post, images}
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const {text, publisher, tags: tagNames, files} = updatePostDto
    const post = await this.findOne(id)
  
    if (files) {
      const images = await this.imageService.uploadManyImages(post, 'Post', files)

      post.images = [...post.images, ...images]
    }

    if (tagNames && tagNames.length) {
      const tags = await this.tagService.handleTags(tagNames, publisher)

      post.tags = [...post.tags, ...tags]
    }

    post.text = text

    return await this.postRepository.save(post)
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
