import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ImageService } from 'src/image/image.service';
import { Image } from 'src/image/entities/image.entity';

@Injectable()
export class UserService {
  private readonly userRepository: Repository<User>
 
  constructor(
    private dataSource: DataSource,
    private readonly imageService: ImageService
  ) {
    this.userRepository = this.dataSource.getRepository(User)
  }

  async create(createUserDto: CreateUserDto) {
    const userPlain = this.userRepository.create(createUserDto)
    const images: Image[] = []

    if (createUserDto.file) {
      const image = await this.imageService.uploadImage(createUserDto.file)

      images.push(image)
    }

    userPlain.images = images

    const user = await this.userRepository.save(userPlain)

    return user
  }

  async findAll() {
    return await this.userRepository.find()
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({where: {email}})
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({where: {id}})

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  async updateToken(id: number, token: string) {
    const user = await this.findOne(id)

    user.token = token
    
    return await this.userRepository.save(user)
  }

  async confirmEmail(email: string) {
    const user = await this.findByEmail(email)

    if (!user) {
      throw new NotFoundException("User not found")
    }

    user.isVerified = true

    return await this.userRepository.save(user)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
    const userMerged = this.userRepository.merge(user, updateUserDto)
    const images: Image[] = user.images

    if (updateUserDto.file) {
      const image = await this.imageService.uploadImage(updateUserDto.file)
      
      images.push(image)
    }

    userMerged.images = images

    const userUpdated = await this.userRepository.save(userMerged)
 
    return userUpdated
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.userRepository.delete(id)
    
    return "User deleted"
  }
}
