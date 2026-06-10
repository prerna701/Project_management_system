import { PartialType, PickType } from '@nestjs/swagger';
import { CreateManualTimeLogDto } from './create-manual-time-log.dto';

export class UpdateTimeLogDto extends PartialType(
  PickType(CreateManualTimeLogDto, [
    'startedAt',
    'endedAt',
    'description',
    'workType',
    'manualEntryReason',
    'isBillable',
  ] as const),
) {}
