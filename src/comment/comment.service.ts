import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostService } from 'src/post/post.service';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';
import { VoteService } from 'src/vote/vote.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VoteCommentDto } from './dto/vote-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly postService: PostService,
    private readonly voteService: VoteService,
    private readonly prisma: PrismaService
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const {text, commenterId, commentId, postId} = createCommentDto
    let depth = 0

    if (commentId) {
      const comment = await this.findOne(commentId)

      depth = comment.depth + 1
    } 

    return await this.prisma.comment.create({
      data: {
        text,
        commenter: {connect: {id: commenterId}},
        post: {connect: {id: postId}},
        depth
      }
    })
  }

  async findAll(postId: number) {
    return await this.prisma.comment.findMany()
  }

  async vote(voteCommentDto: VoteCommentDto) {
    const {commentId, userId, value} = voteCommentDto

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
    return await this.prisma.comment.findFirstOrThrow({where: {id}})
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const {text, commenterId, commentId, postId} = updateCommentDto

    return await this.prisma.comment.update({
      where: {id},
      data: {
        text
      }
    })
  }

  async remove(id: number) {
    return await this.prisma.comment.delete({where: {id}})
  }
}
