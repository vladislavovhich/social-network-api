import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DataSource, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityType, Models, resType } from './image.types';

@Injectable()
export class ImageService {
    private readonly imageRepository: Repository<Image>

    constructor(
        private readonly cloudinary: CloudinaryService,
        private dataSource: DataSource
    ) {
        this.imageRepository = this.dataSource.getRepository(Image)
    }

    async uploadImage(file: Express.Multer.File) {
        const {url} = await this.cloudinary.uploadImage(file)

        const imagePlain = this.imageRepository.create({url})
        const image = await this.imageRepository.save(imagePlain)

        return image
    }

    async uploadManyImages(files: Express.Multer.File[]) {
        const images: Image[] = []
    
        for (let file of files) {
            const image = await this.uploadImage(file)

            images.push(image)
        }

        return images
    }
}
