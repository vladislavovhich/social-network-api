import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { DataSource, Repository } from 'typeorm';
import { View } from './entities/view.entity';
import { UserService } from 'src/user/user.service';
import { PostService } from 'src/post/post.service';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ViewService {
  private readonly viewRepository: Repository<View>

  constructor(
    private dataSource: DataSource,
    private readonly userService: UserService,
    private readonly postService: PostService
  ) {
    this.viewRepository = this.dataSource.getRepository(View)
  }

  async markPostAsViewed(createViewDto: CreateViewDto) {
    const user = await this.userService.findOne(createViewDto.userId)
    const post = await this.postService.findOne(createViewDto.postId)

    await this.isViewed(post, user)

    const viewPlain = this.viewRepository.create({viewer: user, post})

    return await this.viewRepository.save(viewPlain)
  }

  async isViewed(post: Post, user: User) {
    const view = await this.viewRepository.findOne({
      where: {
        viewer: {id: user.id},
        post: {id: post.id}
      }
    })

    if (view) {
      throw new BadRequestException("You've already marked this post as seen")
    }
  }
}
