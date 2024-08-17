import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetRuleDto } from './dto/get-rule.dto';

@ApiTags("Rule")
@Controller('/')
export class RuleController {
  constructor(
    private readonly ruleService: RuleService
  ) {}

  @Get('/groups/:groupId/rules')

  @ApiOkResponse({type: [GetRuleDto], description: "Group rules"})
  @ApiNotFoundResponse({description: "Group not found"})

  getGroupRules(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.ruleService.getGroupRules(groupId)
  }


  @Post('/groups/:groupId/rules')

  @ApiOkResponse({type: GetRuleDto, description: "Created Rule"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to create rules"})
  @ApiResponse({description: "Not authorized", status: 401})
  @ApiNotFoundResponse({description: "Group not found"})

  create(@Body() createRuleDto: CreateRuleDto, @Param('groupId', ParseIntPipe) groupId: number) {
    createRuleDto.groupId = groupId

    return this.ruleService.create(createRuleDto);
  }


  @Patch('/rules/:ruleId')

  @ApiOkResponse({type: GetRuleDto, description: "Updated Rule"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to edit rules"})
  @ApiResponse({description: "Not authorized", status: 401})
  @ApiNotFoundResponse({description: "Rule not found"})

  update(
    @Param('ruleId', ParseIntPipe) ruleId: number, 
    @Body() updateRuleDto: UpdateRuleDto
  ) {
    return this.ruleService.update(ruleId, updateRuleDto);
  }


  @Delete('/rules/:ruleId')

  @ApiOkResponse({description: "Rule is deleted"})
  @ApiBadRequestResponse({description: "Incorrect input data"})
  @ApiForbiddenResponse({description: "Only admin allowed to delete rules"})
  @ApiResponse({description: "Not authorized", status: 401})
  @ApiNotFoundResponse({description: "Rule not found"})


  remove(@Param('ruleId', ParseIntPipe) id: number) {
    return this.ruleService.remove(id);
  }
}
