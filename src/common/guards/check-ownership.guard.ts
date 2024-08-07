import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Models, } from "../decorators/check-ownership.decorator";
import { DataSource } from "typeorm";

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
        private readonly reflector: Reflector,
        private readonly dataSource: DataSource
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: User = await request.user;
        const resourceId = request.params.id;
        const resourceType = this.reflector.get<string>('resourceType', context.getHandler());
        const ownerKey = this.reflector.get<string>('ownerKey', context.getHandler());

        if (!resourceType) {
            throw new UnauthorizedException('Resource type is not specified');
        }

        if (!ownerKey) {
            throw new UnauthorizedException('Owner key is not specified');
        }

        const resourceRepository = this.dataSource.getRepository(Models[resourceType])
        const resource = await resourceRepository.findOne({where: {id: resourceId}})

        if (!resource || resource[ownerKey] !== user.id) {
            throw new ForbiddenException('Access denied');
        }

        return true;
    }
}