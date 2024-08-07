import { SetMetadata } from '@nestjs/common';

export const CheckVerified = (checkVerified: boolean = true) => SetMetadata('checkVerified', checkVerified);