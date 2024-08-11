import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Image } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImageService {
    constructor(
        private readonly cloudinary: CloudinaryService,
        private readonly prisma: PrismaService,
    ) {}

    async uploadImage(file: Express.Multer.File) {
        const {url} = await this.cloudinary.uploadImage(file)

        const image = await this.prisma.image.create({
            data: {url}
        })

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
