import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ImageService } from 'src/image/image.service';

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
    const userCreated = this.userRepository.create(createUserDto)
    const user = await this.userRepository.save(userCreated)

    if (createUserDto.file) {
      const image = await this.imageService.uploadImage(user, 'User', createUserDto.file)

      return {...user, pfp: image}
    }

    return {...user, pfp: null}
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

    const images = await this.imageService.getImages(user, 'User')

    return {...user, pfp: images.length ? images.at(-1): null}
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
    const userUpdated = await this.userRepository.save(userMerged)

    const images = await this.imageService.getImages(user, 'User')

    if (updateUserDto.file) {
      const image = await this.imageService.uploadImage(user, 'User', updateUserDto.file)
      
      images.push(image)
    }
 
    return {...userUpdated, pfp: images.length ? images.at(-1): null}
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.userRepository.delete(id)
    
    return "User deleted"
  }
}
