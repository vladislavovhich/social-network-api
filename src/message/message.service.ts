import { BadRequestException, Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessageReadDto } from './dto/message-read.dto';
import { Message, Prisma, User } from '@prisma/client';
import { UserInfoDto } from 'src/user/dto/user-info.dto';
import { UserService } from 'src/user/user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserDialogsResponseDto } from './dto/user-dialogs-response.dto';
import { UserDialogDto } from './dto/user-dialog.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    const {receiverId, senderId, text} = sendMessageDto

    await this.prisma.user.findFirstOrThrow({where: {id: receiverId}})

    if (receiverId == senderId) {
      throw new BadRequestException("You can't send message to yourself!")
    }

    const message = await this.prisma.message.create({
      data: {
        receiver: {connect: {id: receiverId}},
        sender: {connect: {id: senderId}},
        text,
        dialog_between: `${Math.min(receiverId, senderId)}-${Math.max(receiverId, senderId)}`
      }
    })

    return message
  }

  async editMessage(editMessageDto: EditMessageDto) {
    const {text, senderId, messageId} = editMessageDto

    const message = await this.findOne(messageId)

    if (message.senderId != senderId) {
      throw new BadRequestException("You can't edit this message cause it doesn't belongs to you!")
    }

    await this.update(messageId, {text})
  }

  async markMessageAsRead(messageReadDto: MessageReadDto) {
    const {receiverId, messageId} = messageReadDto

    const message = await this.findOne(messageId)

    if (message.receiverId != receiverId) {
      throw new BadRequestException("You can't mark the message as read cause it send not to you!")
    }

    await this.update(messageId, {isSeen: true})
  }
 
  private getOptionsForDialogs(userId: number): Prisma.MessageFindManyArgs {
    return {
      where: {
        OR: [
          {
            dialog_between: {
              contains: `${userId}-`
            }
          },
          {
            dialog_between: {
              contains: `-${userId}`
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      distinct: "dialog_between",
      include: {
        receiver: {
          include: {
            images: {
              include: {
                image: true
              }
            }
          }
        },
        sender: {
          include: {
            images: {
              include: {
                image: true
              }
            }
          }
        }
      }
    }
  }

  async getMessages(userId: number, receiverId: number, paginationDto: PaginationDto) {
    const options = this.getOptionsForDialogs(userId)

    const {offset, pageSize} = paginationDto

    const dialogs = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            dialog_between: {
              contains: `${userId}-${receiverId}`
            }
          },
          {
            dialog_between: {
              contains: `${receiverId}-${userId}`
            }
          }
        ]
      },
      orderBy: options.orderBy,
      include: options.include,
      take: pageSize,
      skip: offset
    })

    const count = await this.prisma.message.count({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    })

    const dialogDtos = dialogs.map(dialog => new UserDialogDto(dialog, dialog.sender))

    return new UserDialogsResponseDto(dialogDtos, count, paginationDto)
  }

  async getDialogs(userId: number, paginationDto: PaginationDto) {
    const options = this.getOptionsForDialogs(userId)

    const {offset, pageSize} = paginationDto

    const dialogs = await this.prisma.message.findMany({
      where: options.where,
      orderBy: options.orderBy,
      distinct: options.distinct,
      include: options.include,
      take: pageSize,
      skip: offset
    })

    const count = await this.prisma.$queryRaw<number>`
      SELECT COUNT(DISTINCT "dialog_between") AS count
      FROM "Message"
      WHERE "dialog_between" LIKE '${userId}-%' OR "dialog_between" LIKE '-${userId}'
    `

    const dialogDtos = dialogs.map(dialog => {
      if (dialog.receiverId == userId) {
        return new UserDialogDto(dialog, dialog.sender)
      } else {
        return new UserDialogDto(dialog, dialog.receiver)
      }
    })

    return new UserDialogsResponseDto(dialogDtos, count, paginationDto)
  } 

  async update(id: number, data: Prisma.MessageUpdateInput) {
    await this.prisma.message.update({
      where: {id},
      data
    })
  }

  async findOne(id: number) {
    return this.prisma.message.findFirstOrThrow({where: {id}})
  }
}
