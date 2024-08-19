import { SetMetadata } from '@nestjs/common';

export const CheckOwnership = (check: boolean = false) => SetMetadata('check', check);