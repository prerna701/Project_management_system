import { Milestone } from '../../domain/milestone';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';
import { MilestoneStatus } from '../../enums/milestone-status.enum';

export interface MilestoneStatusHistoryEntry {
  id: string;
  milestoneId: string;
  fromStatus: MilestoneStatus;
  toStatus: MilestoneStatus;
  changedBy: string;
  note: string | null;
  createdAt: Date;
}

export abstract class MilestonesRepository {
  abstract findById(id: string): Promise<Milestone | null>;
  abstract findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Milestone[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Milestone>): Promise<Milestone>;
  abstract update(id: string, item: Partial<Milestone>): Promise<Milestone | null>;
  abstract remove(id: string): Promise<void>;
  abstract recordStatusChange(
    entry: Omit<MilestoneStatusHistoryEntry, 'id' | 'createdAt'>,
  ): Promise<MilestoneStatusHistoryEntry>;
  abstract findStatusHistory(milestoneId: string): Promise<MilestoneStatusHistoryEntry[]>;
}
