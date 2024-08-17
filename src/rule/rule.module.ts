import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { BanModule } from 'src/ban/ban.module';

@Module({
  controllers: [RuleController],
  providers: [RuleService],
  imports: [PrismaModule, GroupModule, BanModule]
})
export class RuleModule {}
