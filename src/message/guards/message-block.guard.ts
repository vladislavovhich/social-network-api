import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FriendService } from "src/friend/friend.service";
import { request } from "http";
import { MessageService } from "../message.service";

@Injectable()
export class MessageBlockGuard implements CanActivate {

  constructor(
      private readonly reflector: Reflector, 
      private readonly friendService: FriendService,
      private readonly messageService: MessageService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const itemId = this.reflector.get<string>('itemId', context.getHandler()) || "id"

    const user = await request.user
    const messageId = +request.params[itemId]
    const message = await this.messageService.findOne(messageId)

    const isBlocked = await this.friendService.isBlocked(message.receiverId, user.id)

    if (isBlocked) {
        throw new BadRequestException("You're blocked by the user, so you can't talk to him!")
    }
    
    return true;
  }
}