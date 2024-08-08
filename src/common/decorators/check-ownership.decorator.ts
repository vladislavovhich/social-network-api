import { SetMetadata, applyDecorators } from '@nestjs/common';
import { resType } from 'src/image/image.types';

export const CheckOwnership = (resourceType: resType, ownerKey = "ownerId") => {
    return applyDecorators(
        SetMetadata('resourceType', resourceType),
        SetMetadata('ownerKey', ownerKey)
    );
}