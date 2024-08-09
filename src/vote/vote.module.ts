import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';

@Module({
  controllers: [],
  providers: [VoteService],
  exports: [VoteService]
})
export class VoteModule {}
