import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ImageService } from 'src/image/image.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Image } from '@prisma/client';
import { UserProfileDto } from './dto/user-profile.dto';
import { Prisma } from '@prisma/client';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { UserSearchDto } from './dto/user-search.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService
  ) {}

  async search(usersPaginationDto: UserPaginationDto) {
    const {username, birthDate, order, pageSize, offset} = usersPaginationDto
    const params = this.getUserFindManyArgs()

    const dateParams: Prisma.UserWhereInput = {}
    
    if (birthDate != undefined && order != undefined) {
      switch (order) {
        case "before": {
          dateParams.birthDate = {
            lte: birthDate
          }
        }
        case "after": {
          dateParams.birthDate = {
            gte: birthDate
          }
        }
      }
    } else if (birthDate == undefined && order != undefined || birthDate != undefined && order == undefined) {
      throw new BadRequestException("When filtering by date you must pass both date and order!")
    }

    const whereParams: Prisma.UserWhereInput = {
      username: {
        contains: username,
        mode: "insensitive"
      },
      ...dateParams
    }
    
    const users = await this.prisma.user.findMany({
      where: whereParams,
      select: params.select,
      skip: offset,
      take: pageSize
    })

    const count = await this.prisma.user.count({
      where: whereParams
    })

    const userDtos = users.map(user => new UserSearchDto(user))

    return new UsersResponseDto(userDtos, count, usersPaginationDto)
  }

  private getUserFindManyArgs(): Prisma.UserFindManyArgs {
    return {
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
    }
  }

  async findOneProfile(userId: number) {
    const params = this.getUserFindManyArgs()

    const user = await this.prisma.user.findFirstOrThrow({
      where: {id: userId},
      select: params.select
    })

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
