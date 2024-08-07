import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [],
  providers: [ImageService],
  imports: [CloudinaryModule],
  exports: [ImageService]
})
export class ImageModule {}
