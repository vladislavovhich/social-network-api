import { SetMetadata } from '@nestjs/common';

export const ItemId = (itemId: string = "id") => SetMetadata('itemId', itemId);