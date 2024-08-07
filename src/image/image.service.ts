import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DataSource, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ImageService {
    private readonly imageRepository: Repository<Image>

    constructor(
        private readonly cloudinary: CloudinaryService,
        private dataSource: DataSource
    ) {
        this.imageRepository = this.dataSource.getRepository(Image)
    }

    async uploadUserImage(user: User, file: Express.Multer.File) {
        const {url} = await this.cloudinary.uploadImage(file)

        const image = this.imageRepository.create({
            url,
            ownerId: user.id,
            ownerType: 'User'
        })

        return await this.imageRepository.save(image)
    }

    async getUserImages(user: User) {
        const images = await this.imageRepository.find({where: {ownerId: user.id, ownerType: 'User'}})

        return images
    }
}
