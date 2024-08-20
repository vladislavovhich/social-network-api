import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Put, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { ApiTags } from '@nestjs/swagger';
import { SendMessageDto } from './dto/send-message.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { UserBlockGuard } from 'src/friend/guards/user-blocked.guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/common/decorators/extract-user.decorator';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageReadDto } from './dto/message-read.dto';
import { MessageBlockGuard } from './guards/message-block.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('/')
@ApiTags("Message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}


  @Get("/users/dialogs")

  @UseGuards(AccessTokenGuard)

  getMessages(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto
  ) {
    return this.messageService.getDialogs(user.id, paginationDto)
  }

  
  @Get("/users/:id/messages") 

  @UseGuards(AccessTokenGuard)

  getMessagesWithUser(
    @Param("id", ParseIntPipe) id: number,
    @Query() paginationDto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.messageService.getMessages(user.id, id, paginationDto)
  }


  @Post("/users/:id/message")

  @UseGuards(UserBlockGuard)
  @UseGuards(AccessTokenGuard)

  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Param("id", ParseIntPipe) receiverId: number,
    @GetUser() user: User
  ) {
    sendMessageDto.receiverId = receiverId
    sendMessageDto.senderId = user.id

    return this.messageService.sendMessage(sendMessageDto)
  }


  @Patch("/messages/:id")

  @UseGuards(MessageBlockGuard)
  @UseGuards(AccessTokenGuard)

  editMessage(
    @Body() editMessageDto: EditMessageDto,
    @Param("id", ParseIntPipe) messageId: number,
    @GetUser() user: User
  ) {
    editMessageDto.messageId = messageId
    editMessageDto.senderId = user.id

    return this.messageService.editMessage(editMessageDto)
  }


  @Put("/messages/:id/mark-as-read")

  @UseGuards(MessageBlockGuard)
  @UseGuards(AccessTokenGuard)

  markMessageAsRead(
    @Param("id", ParseIntPipe) messageId: number,
    @GetUser() user: User
  ) {
    const messageDto = new MessageReadDto()

    messageDto.messageId = messageId
    messageDto.receiverId = user.id

    return this.messageService.markMessageAsRead(messageDto)
  }
}
