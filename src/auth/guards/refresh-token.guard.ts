import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BaseAuthGuard } from "./base-auth.guard";

@Injectable()
export class RefreshTokenGuard extends BaseAuthGuard {
  constructor(reflector: Reflector) {
    super(reflector, 'jwt-refresh');
  }
}