import { PartialType } from '@nestjs/swagger';
import { CreateSubtaskCommentDto } from './create-subtask-comment.dto';

export class UpdateSubtaskCommentDto extends PartialType(CreateSubtaskCommentDto) {}
