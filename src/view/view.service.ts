import { BadRequestException, Injectable } from '@nestjs/common';
import { ViewOperationDto } from './dto/view-operation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ViewService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async markPostAsViewed(viewDto: ViewOperationDto) {
    const {userId, postId} = viewDto

    await this.isViewed(viewDto)
    
    return await this.prisma.view.create({
      data: {
        viewer: {connect: {id: userId}},
        post: {connect: {id: postId}}
      }
    })
  }

  async isViewed(viewDto: ViewOperationDto) {
    const {userId: viewerId, postId} = viewDto
    
    const view = await this.prisma.view.findFirst({
      where: {
        viewerId, postId
      }
    })

    if (view) {
      throw new BadRequestException("This post is already marked as viewed")
    }
  }
}
