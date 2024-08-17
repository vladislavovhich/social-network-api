import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostService } from '../post.service';

@Injectable()
export class PostPublisherGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, 
    private readonly postService: PostService
) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const itemId = this.reflector.get<string>('itemId', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const id = +request.params[itemId]
    const user = await request.user

    const post = await this.postService.findOne(id)

    if (post.publisherId != user.id) {
        throw new ForbiddenException("Access denied")
    }
    
    return true;
  }
}