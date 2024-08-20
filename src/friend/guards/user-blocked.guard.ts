import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FriendService } from "../friend.service";
import { request } from "http";

@Injectable()
export class UserBlockGuard implements CanActivate {

  constructor(
      private readonly reflector: Reflector, 
      private readonly friendService: FriendService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const itemId = this.reflector.get<string>('itemId', context.getHandler()) || "id"

    const user = await request.user
    const blockId = +request.params[itemId]

    const isBlocked = await this.friendService.isBlocked(blockId, user.id)

    if (isBlocked) {
        throw new BadRequestException("You're blocked by the user, so you can't talk to him!")
    }
    
    return true;
  }
}