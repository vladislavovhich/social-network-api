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

    const post = await this.postRepository.save(postPlain)

    return await this.findOne(post.id)
  }

  async findOne(id: number) {
    const postRaw = await this.postRepository.createQueryBuilder("post")
      .leftJoin("post.views", "views")
      .leftJoinAndSelect("post.tags", "tags")
      .leftJoinAndSelect("post.images", "images")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.publisher", "publisher")
      .leftJoinAndSelect("publisher.images", "publisherImages")
      .leftJoin('post.votes', 'votes')
      .where("post.id = :id", {id})
      .select([
        "post.id", "post.text", "post.created_at", "images.id", "images.url",
        "publisher.id", "publisher.username", "tags.id", "tags.name", 
        'SUM(votes.value) as totalVotes', 'COUNT(views) as totalViews',
        'publisherImages.id', 'publisherImages.url', 'COUNT(comments) as totalComments'
      ])
      .groupBy('post.id')
      .addGroupBy('tags.id')
      .addGroupBy('images.id')
      .addGroupBy('publisher.id')
      .addGroupBy('votes.id')
      .addGroupBy('views.id')
      .addGroupBy('publisherImages.id')
      .getRawAndEntities() 

    const post = postRaw.entities[0]

    post.rating = +postRaw.raw[0].totalvotes || 0
    post.watched = +postRaw.raw[0].totalviews || 0
    post.totalComments = +postRaw.raw[0].totalcomments || 0

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

    await this.postRepository.save(post)

    return await this.findOne(id)
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.postRepository.delete(id)

    return "Post deleted"
  }

  async getGroupPosts(groupId: number) {
    await this.groupService.findOne(groupId)

    const postRaw = await this.postRepository.createQueryBuilder("post")
      .leftJoinAndSelect("post.tags", "tags")
      .leftJoinAndSelect("post.images", "postImages")
      .leftJoinAndSelect("post.publisher", "publisher")
      .leftJoin("post.comments", "comments")
      .leftJoinAndSelect("publisher.images", "publisherImages")
      .leftJoin("post.votes", "votes")
      .leftJoin("post.views", "views")
      .select([
        "post.id",
        "post.text",
        "postImages.id",
        "postImages.url",
        "publisher.username",
        "publisherImages.id",
        "publisherImages.url",
        "SUM(votes.value) AS totalVotes",
        "COUNT(views) AS totalVotes",
        "COUNT(comments) AS totalComments"
      ])
      .groupBy("post.id")
      .addGroupBy("postImages.id")
      .addGroupBy("publisher.id")
      .addGroupBy("publisher.username")
      .addGroupBy("publisherImages.id")
      .getRawAndEntities();
    
    const posts: Post[] = []

    for (let i = 0; i < postRaw.entities.length; i++) {
      const post = postRaw.entities[i]

      post.rating = +postRaw.raw[i].totalvotes || 0
      post.watched = +postRaw.raw[i].totalviews || 0
      post.totalComments = +postRaw.raw[i].totalcomments || 0

      posts.push(post)
    }

    return posts
  }

  async vote(postId: number, user: User, value: -1 | 1) {
    const post = await this.postRepository.findOne({
      where: {id: postId},
      relations: {
        votes: true
      }
    })

    if (!post.votes) {
      const vote = await this.voteService.create(new VoteOperationDto(user, value))

      post.votes.push(vote)

      return await this.findOne(postId)
    }

    const voteIndex = post.votes.findIndex(v => v.voter && v.voter.id == user.id)

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
