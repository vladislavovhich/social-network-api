import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FriendModule } from 'src/friend/friend.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [PrismaModule, FriendModule]
})
export class MessageModule {}
