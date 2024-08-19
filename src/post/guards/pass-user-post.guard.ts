import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GroupService } from "src/group/group.service";
import { UserPassEnum } from "src/group/group.types";
import { PostService } from "../post.service";

@Injectable()
export class PassUserPostGuard implements CanActivate {

  constructor(
      private readonly reflector: Reflector, 
      private readonly groupService: GroupService,
      private readonly postService: PostService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const itemId = this.reflector.get<string>('itemId', context.getHandler()) || "id"
    const passType = this.reflector.get<UserPassEnum>('passType', context.getHandler())
    const check = !!this.reflector.get<boolean>('check', context.getHandler())

    const request = context.switchToHttp().getRequest();

    const id = +request.params[itemId]
    const user = await request.user

    const post = await this.postService.findOne(id)

    const isAdmin = await this.groupService.isActionAllowed(post.groupId, user.id, passType, false)
    const isBelongs = user.id == post.publisherId

    if (check && !isAdmin && !isBelongs) {
      throw new BadRequestException("You must be either post publisher, admin or moderator to access it!")
    }

    return true;
  }
}