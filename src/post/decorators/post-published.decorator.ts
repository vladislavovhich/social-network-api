import { SetMetadata } from '@nestjs/common';

export const IsPostPublished = (itemId: string = "id") => SetMetadata('itemId', itemId);