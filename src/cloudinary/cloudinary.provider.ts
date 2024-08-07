import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from 'src/config/configuration.types';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],

  useFactory: (configService: ConfigService) => {
    const cloudinaryConfig = configService.get<CloudinaryConfig>('cloudinary')

    return cloudinary.config({
        cloud_name: cloudinaryConfig.cloudName,
        api_key: cloudinaryConfig.apiKey,
        api_secret: cloudinaryConfig.apiSecret
    });
  },
};