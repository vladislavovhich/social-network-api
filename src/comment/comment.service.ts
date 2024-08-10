import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PostService } from 'src/post/post.service';
import { NotFoundError } from 'rxjs';
import { User } from 'src/user/entities/user.entity';
import { VoteOperationDto } from 'src/vote/dto/vote-operation.dto';
import { VoteService } from 'src/vote/vote.service';

@Injectable()
export class CommentService {
  private readonly commentTreeRepository: TreeRepository<Comment>
  private readonly commentRepository: Repository<Comment>

  constructor(
    private readonly postService: PostService,
    private readonly voteService: VoteService,
    private dataSource: DataSource
  ) {
    this.commentTreeRepository = this.dataSource.getTreeRepository(Comment)
    this.commentRepository = this.dataSource.getRepository(Comment)
  }

  async create(createCommentDto: CreateCommentDto) {
    const post = await this.postService.findOne(createCommentDto.postId)

    const commentPlain = this.commentTreeRepository.create({
      text: createCommentDto.text,
      commenter: createCommentDto.commenter,
      post
    })

    if (createCommentDto.commentId) {
      const commentParent = await this.findOne(createCommentDto.commentId)

      commentPlain.parent = commentParent
    }

    return await this.commentTreeRepository.save(commentPlain)
  }

  async findAll(postId: number) {
    const comments = await this.commentRepository.createQueryBuilder("comment")
        .where("comment.postId = :postId", { postId })
        .leftJoinAndSelect("comment.commenter", "commenter")
        .leftJoinAndSelect("comment.votes", "votes")
        .andWhere("comment.parentId IS NULL")
        .getMany();
    
    for (let comment of comments) {
      const children = await this.commentRepository.find({
          where: {
              parent: { id: comment.id }
          },
          relations: ["commenter", "votes"]
      })

      comment.rating = comment.votes.reduceRight((cur, prev) => cur + prev.value, 0)

      for (let child of children) {
        child.rating = child.votes.reduceRight((cur, prev) => cur + prev.value, 0)
      }

      comment.children = children

    }

    return comments
  }

  async vote(commentId: number, user: User, value: -1 | 1) {
    const post = await this.commentRepository.findOne({
      where: {id: commentId},
      relations: {
        votes: true
      }
    })

    const voteIndex = post.votes.findIndex(v => v.voter && v.voter.id == user.id)

    if (voteIndex == -1) {
      const vote = await this.voteService.create(new VoteOperationDto(user, value))

      post.votes.push(vote)
    } else {
      const vote = await this.voteService.update(post.votes[voteIndex].id, new VoteOperationDto(user, value))

      post.votes[voteIndex] = vote
    }

    await this.commentRepository.save(post)

    return await this.findOne(commentId)
  }

  async findOne(id: number) {
    const comment = await this.commentTreeRepository.findOne({where: {id}})

    if (!comment) {
      throw new NotFoundException("Comment not found!")
    }

    return comment
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id)

    comment.text = updateCommentDto.text

    return await this.commentRepository.save(comment)
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
