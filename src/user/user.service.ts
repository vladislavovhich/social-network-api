import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Image } from '@prisma/client';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService
  ) {}

  async findOneProfile(userId: number) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {id: userId},
      select: {
        id: true,
        username: true,
        birthDate: true,
        email: true,
        createdAt: true,
        groups: {
          select: {
            group: true
          }
        },
        images: {
          select: {
            image: true
          }
        }
      }
    })

    console.log(user)

    return new UserProfileDto(user)
  }

  async create(createUserDto: CreateUserDto) {
    const images: Image[] = []
    const {email, password, username, file, birthDate} = createUserDto

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    const user = await this.prisma.user.create({
      data: {
        email, 
        password, 
        username, 
        birthDate,
        images: {
          create: images.map(image => ({image: {connect: {id: image.id}}}))
        }
      }
    })

    return user
  }

  async findAll() {
    return await this.prisma.user.findMany()
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({where: {email}})
  }

  async findOne(id: number) {
    return await this.prisma.user.findFirstOrThrow({
      where: {id},
    })
  }

  async updateToken(id: number, token: string) {
    return await this.prisma.user.update({
      where: {id},
      data: {token}
    })
  }

  async confirmEmail(email: string) {
    const user = await this.findByEmail(email)

    return await this.prisma.user.update({
      where: {id: user.id}, 
      data: {isVerified: true}
    })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id)

    const images: Image[] = []
    const {username, file, birthDate} = updateUserDto

    if (file) {
      const image = await this.imageService.uploadImage(file)

      images.push(image)
    }

    return await this.prisma.user.update({
      where: {id},
      data: { 
        username, 
        birthDate,
        images: {
          create: images.map(image => ({image: {connect: {id: image.id}}}))
        }
      }
    })
  }

  async remove(id: number) {
    await this.findOne(id)
    
    return await this.prisma.user.delete({where: {id}})
  }
}
