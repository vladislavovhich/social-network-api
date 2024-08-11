import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource, Repository } from 'typeorm';
import { GroupService } from 'src/group/group.service';
import { TagService } from 'src/tag/tag.service';
import { ImageService } from 'src/image/image.service';
import { VoteService } from 'src/vote/vote.service';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';
import { Image, Tag } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { VotePostDto } from './dto/vote-post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly tagService: TagService,
    private readonly imageService: ImageService,
    private readonly voteService: VoteService,
    private readonly prisma: PrismaService
  ) {}

  async create(createPostDto: CreatePostDto) {
    const {text, groupId, publisherId, tags: tagNames, files} = createPostDto

    const images: Image[] = []
    const tags = await this.tagService.handleTags(tagNames, publisherId)

    if (files) {
      const imagesUploaded = await this.imageService.uploadManyImages(files)

      for (let image of imagesUploaded) {
        images.push(image)
      }
    }

    return await this.prisma.post.create({
      data: {
        text, 
        group: {connect: {id: groupId}},
        publisher: {connect: {id: publisherId}},
        tags: {
          create: tags.map(tag => ({tag: {connect: {id: tag.id}}}))
        },
        images: {
          create: images.map(image => ({image: {connect: {id: image.id}}}))
        }
      }
    })
  }

  async findOne(id: number) {
    return await this.prisma.post.findFirstOrThrow({where: {id}})
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const {text, publisherId, tags: tagNames, files} = updatePostDto

    const images: Image[] = []
    const tagsRaw = await this.tagService.handleTags(tagNames, publisherId)
    const tags: Tag[] = []

    if (files) {
      const imagesUploaded = await this.imageService.uploadManyImages(files)

      for (let image of imagesUploaded) {
        images.push(image)
      }
    }

    for (let tag of tagsRaw) {
      let isExist = await this.prisma.postTag.findFirst({
        where: {
          postId: id,
          tagId: tag.id
        }
      })

      if (!isExist) {
        tags.push(tag)
      }
    }

    return await this.prisma.post.update({
      where: {id},
      data: {
        text, 
        images: {
          create: images.map(image => ({image: {connect: {id: image.id}}}))
        }
      }
    })
  }

  async remove(id: number) {
    return await this.prisma.post.delete({where: {id}})
  }

  async getGroupPosts(groupId: number) {
    return await this.prisma.group.findFirstOrThrow({
      where: {id: groupId},
      select: {
        posts: true
      }
    })
  }

  async vote(votePostDto: VotePostDto) {
    const {postId, userId, value} = votePostDto

    const postVote = await this.prisma.postVote.findFirst({
      where: {
        post: {
          id: postId
        },
        vote: {
          voterId: userId
        }
      },
      select: {
        vote: true
      }
    })

    const voteDto = new VoteOperationDto(userId, value)

    if (postVote) {
      await this.voteService.update(postVote.vote.id, voteDto)
    } else {
      const vote = await this.voteService.create(voteDto)

      await this.prisma.post.update({
        where: {id: postId},
        data: {
          votes: {
            create: [
              {vote: {connect: {id: vote.id}}}
            ]
          }
        }
      })
    }
  }
}
