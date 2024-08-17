import { SetMetadata } from '@nestjs/common';
import { UserPassEnum } from '../group.types';

export const PassOnly = (passType: UserPassEnum) => SetMetadata('passType', passType);