import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [ImageService],
  imports: [CloudinaryModule, PrismaModule],
  exports: [ImageService]
})
export class ImageModule {}
