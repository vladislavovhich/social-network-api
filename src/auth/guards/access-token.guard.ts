import { Reflector } from '@nestjs/core';
import { BaseAuthGuard } from './base-auth.guard';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenGuard extends BaseAuthGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'jwt');
  }
}