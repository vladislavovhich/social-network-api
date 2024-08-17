import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GroupService } from "../group.service";
import { UserPassEnum } from "../group.types";
import { BanService } from "src/ban/ban.service";

@Injectable()
export class PassUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, 
    private readonly groupService: GroupService,
    private readonly banService: BanService
) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const groupId = this.reflector.get<string>('groupId', context.getHandler());
    const passType = this.reflector.get<string>('passType', context.getHandler())
    
    const id = +request.params[groupId]
    const user = await request.user

    const isAdmin = await this.groupService.isAdmin(id, user.id)
    const isModerator = await this.groupService.isModerator(user.id, id)

    const isBanned = await this.banService.isBanned(user.id, id)

    if (isBanned) {
      throw new ForbiddenException("You're banned, so you can't access it")
    }

    if (passType) {
      switch (passType) {
        case UserPassEnum.Admin: {
          if (!isAdmin) {
            throw new ForbiddenException("You aren't admin, so you can't do this action!")
          }
        }

        case UserPassEnum.AdminAndModerators: {
          if (!isAdmin && (isAdmin == isModerator)) {
            throw new ForbiddenException("You are neigther admin nor moderator, so you can't do this action!")
          }
        }

        case UserPassEnum.Moderators: {
          if (!isModerator) {
            throw new ForbiddenException("You aren't moderator, so you can't do this action!")
          }
        }
      }
    }

    return true;
  }
}