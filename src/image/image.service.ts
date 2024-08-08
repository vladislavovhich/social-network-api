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

    async uploadImage(item: EntityType, type: resType, file: Express.Multer.File) {
        const {url} = await this.cloudinary.uploadImage(file)

        const image = this.imageRepository.create({
            url,
            ownerId: item.id,
            ownerType: type
        })

        return await this.imageRepository.save(image)
    }

    async uploadManyImages(item: EntityType, type: resType, files: Express.Multer.File[]) {
        const images: Image[] = []
    
        for (let file of files) {
            const image = await this.uploadImage(item, type, file)

            images.push(image)
        }

        return images
    }

    async getImages(item: EntityType, type: resType) {
        const images = await this.imageRepository.find({where: {ownerId: item.id, ownerType: type}})

        images.sort((a, b) => a.id - b.id)
        
        return images
    }
}
