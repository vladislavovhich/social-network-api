import { Injectable, NotFoundException } from '@nestjs/common';
import { VoteOperationDto } from './dto/vote-operation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VoteService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(voteDto: VoteOperationDto) {
    const {voterId, value} = voteDto

    return await this.prisma.vote.create({
      data: {
        value,
        voter: {connect: {id: voterId}},
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.vote.findFirst({where: {id}})
  }

  async update(id: number, voteDto: VoteOperationDto) {
    const {value} = voteDto

    return await this.prisma.vote.update({
      where: {id},
      data: {
        value
      }
    })
  }
}
