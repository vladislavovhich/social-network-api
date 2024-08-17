import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PostService } from '../post.service';

@Injectable()
export class PostPublishedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, 
    private readonly postService: PostService
) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const itemId = this.reflector.get<string>('itemId', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const id = +request.params[itemId]

    const post = await this.postService.findOne(id)

    if (!post.isPublished) {
        throw new BadRequestException("This post is not published, so you can't access it")
    }

    return true;
  }
}