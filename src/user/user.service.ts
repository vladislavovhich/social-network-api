import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Not, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly userRepository: Repository<UserEntity>

  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(UserEntity)
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create(createUserDto)

    return await this.userRepository.save(user)
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
    const userUpdated = this.userRepository.merge(user, updateUserDto)

    return await this.userRepository.save(userUpdated)
  }

  async remove(id: number) {
    await this.findOne(id)
    
    return await this.userRepository.delete(id)
  }
}
