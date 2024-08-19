import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GroupService } from "../group.service";
import { UserPassEnum } from "../group.types";

@Injectable()
export class PassUserGuard implements CanActivate {
  constructor(
      private readonly reflector: Reflector, 
      private readonly groupService: GroupService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const groupIdName = this.reflector.get<string>('itemId', context.getHandler()) || "id";
    const passType = this.reflector.get<UserPassEnum>('passType', context.getHandler())
    
    const groupId = +request.params[groupIdName]
    const user = await request.user

    await this.groupService.isActionAllowed(groupId, user.id, passType)

    return true;
  }
}