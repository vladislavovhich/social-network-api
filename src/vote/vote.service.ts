import { Injectable, NotFoundException } from '@nestjs/common';
import { VoteOperationDto } from './dto/vote-operation.dto';
import { DataSource, Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';

@Injectable()
export class VoteService {
  private readonly voteRepository: Repository<Vote>

  constructor(
    private dataSource: DataSource
  ) {
    this.voteRepository = this.dataSource.getRepository(Vote)
  }

  async create(voteDto: VoteOperationDto) {
    const votePlain = this.voteRepository.create({
      voter: voteDto.voter,
      value: voteDto.value
    })

    return await this.voteRepository.save(votePlain)
  }

  async findOne(id: number) {
    const vote = await this.voteRepository.findOne({where: {id}})

    if (!vote) {
      throw new NotFoundException("Vote not found!")
    }

    return vote
  }

  async update(id: number, voteDto: VoteOperationDto) {
    const vote = await this.findOne(id)

    vote.value = voteDto.value

    return await this.voteRepository.save(vote)
  }
}
