import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DataSource, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityType, Models } from './image.types';

@Injectable()
export class ImageService {
    private readonly imageRepository: Repository<Image>

    constructor(
        private readonly cloudinary: CloudinaryService,
        private dataSource: DataSource
    ) {
        this.imageRepository = this.dataSource.getRepository(Image)
    }

    async uploadImage(item: EntityType, file: Express.Multer.File) {
        const {url} = await this.cloudinary.uploadImage(file)

        const image = this.imageRepository.create({
            url,
            ownerId: item.id,
            ownerType: item.constructor.name
        })

        return await this.imageRepository.save(image)
    }

    async getImages(item: EntityType) {
        const images = await this.imageRepository.find({where: {ownerId: item.id, ownerType: item.constructor.name}})

        return images
    }
}
