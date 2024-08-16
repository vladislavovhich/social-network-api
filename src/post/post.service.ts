import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource, Repository } from 'typeorm';
import { GroupService } from 'src/group/group.service';
import { TagService } from 'src/tag/tag.service';
import { ImageService } from 'src/image/image.service';
import { VoteService } from 'src/vote/vote.service';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';
import { Image, Post, Tag } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { VotePostDto } from './dto/vote-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { endOfDay, endOfHour, endOfMonth, endOfToday, endOfWeek, endOfYear, startOfDay, startOfHour, startOfMonth, startOfToday, startOfWeek, startOfYear } from 'date-fns';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostPaginationResponseDto } from './dto/post-pagination-response.dto';
import { DateFilterType, PostFilterType } from 'src/common/types';
import { PostPaginationDto } from './dto/post-pagination.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly tagService: TagService,
    private readonly imageService: ImageService,
    private readonly voteService: VoteService,
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService
  ) {}

  async create(createPostDto: CreatePostDto) {
    const {text, groupId, publisherId, tags: tagNames, files} = createPostDto

    await this.groupService.findOne(groupId)

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

  async getFeedPosts(userId: number, paginationDto: PostPaginationDto) {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    const posts = await this.findMany({
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      },
      group: {
        subs: {
          some: {
            userId: userId
          }
        }
      }
    }, [
      { createdAt: "desc" }
    ], paginationDto)

    return posts
  }

  async getGroupPost(postId: number) {
    const post = await this.prisma.post.findFirst({
      where: {id: postId},
      select: this.getSelectParams()
    })

    const postVotes = await this.prisma.vote.aggregate({
      _sum: {
        value: true
      },
      where: {
        posts: {
          some: {
            post: {
              id: postId
            }
          }
        }
      }
    })

    return new GetPostDto({...post, _sum: postVotes._sum.value || 0})
  }

  async findOne(id: number) {
    return await this.prisma.post.findFirstOrThrow({where: {id}})
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const {text, publisherId, tags: tagNames, files} = updatePostDto

    await this.findOne(id)

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

  private getSelectParams() {
    return {
        id: true,
        text: true,
        publisher: {
          select: {
            id: true,
            username: true,
            images: {
              select: {
                image: true
              }
            }
          }
        },
        createdAt: true,
        images: {
          select: {
            image: true
          }
        },
        tags: {
          select: {
            tag: true
          }
        },
        _count: {
          select: {
            comments: true,
            views: true
          }
        },
      } 
  }

  getFilterParams(filterParams: DateFilterType) {
    const today = new Date()

    switch (filterParams) {
      case "week": {
        const start = startOfWeek(today)
        const end = endOfWeek(today)
        
        return {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }
      case "today": {
        const start = startOfToday()
        const end = endOfToday()

        return {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }
      case "month": {
        const start = startOfMonth(today)
        const end = endOfMonth(today)

        return {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }
      case "year": {
        const start = startOfYear(today)
        const end = endOfYear(today)

        return {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }
      default: {
        return {}
      }
    }
  }

  private async handlePostsWithVotes(postsMany: any) {
    const posts: GetPostDto[] = []

    for (let post of postsMany) {
      const postVotes = await this.prisma.vote.aggregate({
        _sum: {
          value: true
        },
        where: {
          posts: {
            some: {
              post: {
                id: post.id
              }
            }
          }
        }
      })

      posts.push(new GetPostDto({...post, _sum: postVotes._sum.value || 0}))
    }

    return posts
  }

  async findMany(
    whereOptions: Prisma.PostWhereInput = {}, 
    orderByOptions: Prisma.PostOrderByWithRelationInput[] = [],
    paginationOptions: PostPaginationDto
  ) {
    const {offset, page, pageSize} = paginationOptions

    const postsMany = await this.prisma.post.findMany({
      skip: offset,
      take: pageSize,
      where: whereOptions,
      select: this.getSelectParams(),
      orderBy: orderByOptions
    })

    const posts = await this.handlePostsWithVotes(postsMany)

    const postCount = await this.prisma.post.count({
      where: whereOptions,
      orderBy: orderByOptions
    })

    return new PostPaginationResponseDto(posts, postCount, paginationOptions)
  }

  async remove(id: number) {
    await this.findOne(id)

    return await this.prisma.post.delete({where: {id}})
  }

  async getGroupPosts(groupId: number, paginationDto: PostPaginationDto) {
    await this.groupService.findOne(groupId)

    const {post, pageSize, offset} = paginationDto
    const dateFilter = this.getFilterParams(paginationDto.date)

    switch (post) {
      case "hot": {
        const today = new Date()
        const hourStart = startOfHour(today)
        const hourEnd = endOfHour(today)
        
        const result = await this.prisma.$queryRaw<{ id: number; votesSum: number }[]>`
          SELECT "Post".id, COALESCE(SUM("Vote".value), 0) as "votesSum"
          FROM "Post"
          LEFT JOIN "PostVote" ON "Post".id = "PostVote"."postId"
          LEFT JOIN "Vote" ON "PostVote"."voteId" = "Vote".id
          WHERE "Vote"."createdAt" BETWEEN ${hourStart} AND ${hourEnd}
          AND "Post"."groupId" = ${groupId}
          GROUP BY "Post".id
          ORDER BY "votesSum" DESC
          LIMIT ${pageSize}
          OFFSET ${offset};
        `

        const posts = await this.findMany({
          id: {
            in: result.map(res => res.id)
          }
        }, [], paginationDto)

        posts.items.sort((p1, p2) => p2.votes - p1.votes)

        return posts
      }
      case "controversial": {
        const posts = await this.findMany({
          groupId, ...dateFilter
        }, [
          {
            comments: {
              _count: "desc"
            }
          },
          {
            createdAt: "desc"
          }
        ], paginationDto)

        return posts
      }
      case "popular": {
        const result = await this.prisma.$queryRaw<{ id: number; votesSum: number }[]>`
          SELECT "Post".id, COALESCE(SUM("Vote".value), 0) as "votesSum"
          FROM "Post"
          LEFT JOIN "PostVote" ON "Post".id = "PostVote"."postId"
          LEFT JOIN "Vote" ON "PostVote"."voteId" = "Vote".id
          WHERE "Post"."createdAt" BETWEEN ${dateFilter.createdAt.gte} AND ${dateFilter.createdAt.lte}
          AND "Post"."groupId" = ${groupId}
          GROUP BY "Post".id
          ORDER BY "votesSum" DESC
          LIMIT ${pageSize}
          OFFSET ${offset};
        `

        const posts = await this.findMany({
          id: {
            in: result.map(res => res.id)
          }
        }, [], paginationDto)

        posts.items.sort((p1, p2) => p2.votes - p1.votes)

        return posts
        }
      default: 
        return await this.findMany({ groupId, ...dateFilter}, [{ createdAt: "desc" }], paginationDto)
    }
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
