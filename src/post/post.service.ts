import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource, Repository } from 'typeorm';
import { GroupService } from 'src/group/group.service';
import { Post } from './entities/post.entity';
import { TagService } from 'src/tag/tag.service';
import { ImageService } from 'src/image/image.service';
import { User } from 'src/user/entities/user.entity';
import { VoteService } from 'src/vote/vote.service';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';

@Injectable()
export class PostService {
  private readonly postRepository: Repository<Post>
  
  constructor(
    private dataSource: DataSource,
    private readonly groupService: GroupService,
    private readonly tagService: TagService,
    private readonly imageService: ImageService,
    private readonly voteService: VoteService
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
    const postRaw = await this.postRepository.createQueryBuilder("post")
      .leftJoin("post.views", "views")
      .leftJoinAndSelect("post.tags", "tags")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.publisher", "publisher")
      .loadRelationCountAndMap('post.views', 'post.views')
      .leftJoinAndSelect('post.votes', 'votes')
      .addSelect('SUM(votes.value)', 'votes')
      .where("post.id = :id", {id})
      .groupBy('post.id')
      .addGroupBy('tags.id')
      .addGroupBy('images.id')
      .addGroupBy('publisher.id')
      .addGroupBy('votes.id')
      .getRawAndEntities() 

    const post = postRaw.entities[0]

    post.rating = +postRaw.raw.reduceRight((prev, cur) => prev + +cur['votes'], 0)

    if (!post) {
      throw new NotFoundException("Post not found!")
    }

    return post
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

  async vote(postId: number, user: User, value: -1 | 1) {
    const post = await this.postRepository.findOne({
      where: {id: postId},
      relations: {
        votes: true
      }
    })

    const voteIndex = post.votes.findIndex(v => v.voter.id == user.id)

    if (voteIndex == -1) {
      const vote = await this.voteService.create(new VoteOperationDto(user, value))

      post.votes.push(vote)
    } else {
      const vote = await this.voteService.update(post.votes[voteIndex].id, new VoteOperationDto(user, value))

      post.votes[voteIndex] = vote
    }

    await this.postRepository.save(post)

    return await this.findOne(postId)
  }
}
