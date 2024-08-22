import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostService } from 'src/post/post.service';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';
import { VoteService } from 'src/vote/vote.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VoteCommentDto } from './dto/vote-comment.dto';
import { CommentTreeDto } from './dto/comment-tree.dto';
import { GetCommentDto } from './dto/get-comment.dto';
import { Comment } from '@prisma/client';
@Injectable()
export class CommentService {
  constructor(
    private readonly postService: PostService,
    private readonly voteService: VoteService,
    private readonly prisma: PrismaService
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const {text, commenterId, commentId, postId} = createCommentDto

    await this.postService.findOne(postId)
  
    let depth = 0

    if (commentId) {
      const comment = await this.findOne(commentId)

      depth = comment.depth + 1
    } 

    const comment = await this.prisma.comment.create({
      data: {
        text,
        commenter: {connect: {id: commenterId}},
        post: {connect: {id: postId}},
        depth,
        parentId: commentId
      }
    })

    return await this.findOnePostComment(comment.id)
  }

  async findOnePostComment(commentId: number) {
    return await this.prisma.comment.findFirst({
      where: {
        id: commentId
      },
      include: {
        commenter: {
          include: {
            pfp: true,
            images: {
              include: {
                image: true
              } 
            }
          },
        },
        votes: {
          include: {
            vote: true
          }
        }
      },
    })
  }

  async findManyPostComment(postId: number, depth: number = 0, commentId: number = 0) {
    return await this.prisma.comment.findMany({
      where: {
        postId,
        depth,
        parentId: commentId
      },
      include: {
        commenter: {
          include: {
            pfp: true,
            images: {
              include: {
                image: true
              } 
            }
          },
        },
        votes: {
          include: {
            vote: true
          }
        }
      },
    })
  }

  async buildCommentsTree(postId: number, comment: Comment, tree: CommentTreeDto) {
    const childrenComments = await this.findManyPostComment(postId, comment.depth + 1, comment.id)

    if (childrenComments.length) {
      for (let children of childrenComments) {
        const chidlrenTree = new CommentTreeDto(new GetCommentDto(children))

        tree.children.push(chidlrenTree)

        await this.buildCommentsTree(postId, children, chidlrenTree)
      }
    }
  }

  async getPostComments(postId: number) {
    await this.postService.findOne(postId)

    const rootComments = await this.findManyPostComment(postId, 0)
    const comments: CommentTreeDto[] = []

    for (let comment of rootComments) {
      const root = new CommentTreeDto(new GetCommentDto(comment))

      await this.buildCommentsTree(postId, comment, root)

      comments.push(root)
    }

    return comments
  }

  async vote(voteCommentDto: VoteCommentDto) {
    const {commentId, userId, value} = voteCommentDto

    await this.findOne(commentId)

    const commentVote = await this.prisma.commentVote.findFirst({
      where: {
        comment: {
          id: commentId
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

    if (commentVote) {
      await this.voteService.update(commentVote.vote.id, voteDto)
    } else {
      const vote = await this.voteService.create(voteDto)

      return await this.prisma.comment.update({
        where: {id: commentId},
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

  async findOne(id: number) {
    return await this.prisma.comment.findFirstOrThrow({
      where: {id},
      include: {
        post: true
      }
    })
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    await this.findOne(id)

    const {text, commenterId, commentId, postId} = updateCommentDto

    const comment = await this.prisma.comment.update({
      where: {id},
      data: {
        text
      }
    })

    return await this.findOnePostComment(comment.id)
  }

  async remove(id: number) {
    const comment = await this.findOne(id)

    return await this.prisma.comment.delete({where: {id}})
  }
}
