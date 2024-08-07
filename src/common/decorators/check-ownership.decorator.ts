import { SetMetadata, applyDecorators } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Image } from 'src/image/entities/image.entity';

export const Models = {
    User, Image
}

export type resType = "User" | "Image"

export const CheckOwnership = (resourceType: resType, ownerKey = "ownerId") => {
    return applyDecorators(
        SetMetadata('resourceType', resourceType),
        SetMetadata('ownerKey', ownerKey)
    );
}