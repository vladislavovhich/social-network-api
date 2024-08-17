import { SetMetadata } from '@nestjs/common';

export const GroupId = (groupId: string = "id") => SetMetadata('groupId', groupId);