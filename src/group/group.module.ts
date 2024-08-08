import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { ImageModule } from 'src/image/image.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [ImageModule, CategoryModule],
  exports: [GroupService]
})
export class GroupModule {}
