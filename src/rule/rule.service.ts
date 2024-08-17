import { Injectable } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupService } from 'src/group/group.service';
import { GetRuleDto } from './dto/get-rule.dto';

@Injectable()
export class RuleService {
  constructor(
    private readonly groupService: GroupService,
    private readonly prisma: PrismaService
  ) {}

  async getGroupRules(groupId: number) {
    await this.groupService.findOne(groupId)

    const rules = await this.prisma.groupRule.findMany({
      where: {groupId},
      orderBy: {
        order: "asc"
      }
    })

    const ruleDtos = rules.map(rule => new GetRuleDto(rule))

    return ruleDtos
  }

  async create(createRuleDto: CreateRuleDto) {
    const {text, title, groupId} = createRuleDto

    await this.groupService.findOne(groupId)

    const lastRule = await this.findOne(groupId)
    const order = !lastRule ? 1 : lastRule.order + 1

    const rule = await this.prisma.groupRule.create({
      data: {
        text,
        title,
        order,
        group: {connect: {id: groupId}}
      }
    })

    return new GetRuleDto(rule)
  }

  async findOne(groupId: number) {
    return await this.prisma.groupRule.findFirst({
      where: {groupId}, 
      orderBy: {
        createdAt: "desc"
      }
    })
  }

  async update(id: number, updateRuleDto: UpdateRuleDto) {
    const {text, title} = updateRuleDto

    await this.prisma.groupRule.findFirstOrThrow({where: {id}})

    const rule = await this.prisma.groupRule.update({
      where: {id},
      data: {
        text,
        title
      }
    })

    return new GetRuleDto(rule)
  }

  async remove(id: number) {
    await this.prisma.groupRule.findFirstOrThrow({where: {id}})

    await this.prisma.groupRule.delete({where: {id}})
  }
}
