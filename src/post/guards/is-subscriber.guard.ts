import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Models } from "src/image/image.types";
import { DataSource } from "typeorm";
import { GroupService } from "src/group/group.service";

@Injectable()
export class SubscriberGuard implements CanActivate {
  constructor(
        private readonly groupService: GroupService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: User = await request.user;
        const groupId = +request.params.id;

        const group = await this.groupService.findOne(groupId)

        if (!group.subscribers.some(sub => sub.id == user.id)) {
            throw new BadRequestException("To publish the post you must be a member of the group!")
        }

        return true;
    }
}