import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetRuleDto } from './dto/get-rule.dto';
import { GroupId } from 'src/group/decorators/group-id.decorator';
import { PassUserGuard } from 'src/group/guards/pass-user.guard';
import { PassOnly } from 'src/group/decorators/pass-type.decorator';
import { UserPassEnum } from 'src/group/group.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@ApiTags("Rule")
@Controller('/')
export class RuleController {
  constructor(
    private readonly ruleService: RuleService
  ) {}

  @Get('/groups/:groupId/rules')

  @ApiOkResponse({type: [GetRuleDto], description: "Group rules"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
 
  getGroupRules(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.ruleService.getGroupRules(groupId)
  }


  @Post('/groups/:groupId/rules')

  @ApiOkResponse({type: GetRuleDto, description: "Created Rule"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to create rules"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiNotFoundResponse({description: "Group not found"})
  @ApiForbiddenResponse({description: "Access denied"})
  
  @GroupId("groupId")
  @PassOnly(UserPassEnum.Admin)
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  create(
    @Body() createRuleDto: CreateRuleDto, 
    @Param('groupId', ParseIntPipe) groupId: number
  ) {
    createRuleDto.groupId = groupId

    return this.ruleService.create(createRuleDto);
  }


  @Patch('/groups/:groupId/rules/:ruleId')

  @ApiOkResponse({type: GetRuleDto, description: "Updated Rule"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to edit rules"})
  @ApiUnauthorizedResponse({description: "Not authorized"})
  @ApiNotFoundResponse({description: "Rule not found"})

  @GroupId("groupId")
  @PassOnly(UserPassEnum.Admin)
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  update(
    @Param('ruleId', ParseIntPipe) ruleId: number,
    @Param('groupId', ParseIntPipe) groupId: number, 
    @Body() updateRuleDto: UpdateRuleDto
  ) {
    return this.ruleService.update(ruleId, updateRuleDto);
  }


  @Delete('/groups/:groupId/rules/:ruleId')

  @ApiOkResponse({description: "Rule is deleted"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to delete rules"})
  @ApiResponse({description: "Not authorized", status: 401})
  @ApiNotFoundResponse({description: "Rule not found"})

  @GroupId("groupId")
  @PassOnly(UserPassEnum.Admin)
  @UseGuards(PassUserGuard)
  @UseGuards(AccessTokenGuard)

  remove(@Param('ruleId', ParseIntPipe) id: number, @Param('groupId', ParseIntPipe) groupId: number) {
    return this.ruleService.remove(id);
  }
}
