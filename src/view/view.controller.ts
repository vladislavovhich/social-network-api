import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ViewService } from './view.service';
import { CreateViewDto } from './dto/create-view.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags('View')
@Controller('/')
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @Post('/posts/:id/view')
  @UseGuards(AccessTokenGuard)
  markPostAsViewed(@Param('id') id: string, @GetUser() user: User) {
    return this.viewService.markPostAsViewed(new CreateViewDto(user.id, +id));
  }
}
