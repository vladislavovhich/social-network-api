import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { ImageModule } from 'src/image/image.module';
import { CategoryModule } from 'src/category/category.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BanModule } from 'src/ban/ban.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [UserModule, ImageModule, CategoryModule, PrismaModule, forwardRef(() => BanModule)],
  exports: [GroupService] 
})
export class GroupModule {}
