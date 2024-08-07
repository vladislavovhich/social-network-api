import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { CloudinaryConfig } from 'src/config/configuration.types';

@Injectable()
export class CloudinaryService {
    private readonly folder: string

    constructor(
        private readonly configService: ConfigService
    ) {
        this.folder = configService.get<CloudinaryConfig>('cloudinary').folder
    }

    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return await cloudinary.uploader.upload(file.path, {folder: this.folder})
    }
}
