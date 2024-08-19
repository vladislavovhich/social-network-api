import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GroupService } from "src/group/group.service";
import { UserPassEnum } from "src/group/group.types";
import { CommentService } from "../comment.service";

@Injectable()
export class PassUserCommentGuard implements CanActivate {

  constructor(
      private readonly reflector: Reflector, 
      private readonly groupService: GroupService,
      private readonly commentService: CommentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const itemId = this.reflector.get<string>('itemId', context.getHandler()) || "id"
    const passType = this.reflector.get<UserPassEnum>('passType', context.getHandler())
    const check = !!this.reflector.get<boolean>('check', context.getHandler())

    const request = context.switchToHttp().getRequest();

    const id = +request.params[itemId]
    const user = await request.user

    const comment = await this.commentService.findOne(id)

    const isAdmin = await this.groupService.isActionAllowed(comment.post.groupId, user.id, passType, false)
    const isBelongs = user.id == comment.commenterId

    if (check && !isAdmin && !isBelongs) {
      throw new BadRequestException("You must be either commenter, admin or moderator to access it!")
    }

    return true;
  }
}