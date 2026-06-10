import { IsEnum, IsInt, Max, Min } from 'class-validator';

export enum ActivityHeartbeatState {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
}

export class ActivityHeartbeatDto {
  @IsEnum(ActivityHeartbeatState)
  state: ActivityHeartbeatState;

  @IsInt()
  @Min(1)
  @Max(120)
  observedSeconds: number;
}
