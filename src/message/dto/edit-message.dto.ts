import { OmitType, PartialType } from '@nestjs/swagger';
import { SendMessageDto } from './send-message.dto';

export class EditMessageDto extends OmitType(SendMessageDto, ['receiverId']) {
    messageId: number
}
