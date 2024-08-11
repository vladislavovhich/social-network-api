import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { ImageModule } from 'src/image/image.module';
import { CategoryModule } from 'src/category/category.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [ImageModule, CategoryModule, PrismaModule],
  exports: [GroupService]
})
export class GroupModule {}
