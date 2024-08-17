import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateRuleDto } from './create-rule.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class UpdateRuleDto extends OmitType(PartialType(CreateRuleDto), ['groupId']) {}
