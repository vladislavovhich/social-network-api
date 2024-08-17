import { forwardRef, Module } from '@nestjs/common';
import { BanService } from './ban.service';
import { BanController } from './ban.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';

@Module({
  controllers: [BanController],
  providers: [BanService],
  imports: [PrismaModule, UserModule,  forwardRef(() => GroupModule)],
  exports: [BanService]
})
export class BanModule {}
