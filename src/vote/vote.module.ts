import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [VoteService],
  exports: [VoteService],
  imports: [PrismaModule]
})
export class VoteModule {}
