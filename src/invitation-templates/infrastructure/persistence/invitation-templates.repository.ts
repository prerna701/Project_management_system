import { InvitationTemplate } from '../../domain/invitation-template';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class InvitationTemplatesRepository {
  abstract findById(id: string): Promise<InvitationTemplate | null>;
  abstract findAll(options: { paginationOptions: IPaginationOptions }): Promise<{ items: InvitationTemplate[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<InvitationTemplate>): Promise<InvitationTemplate>;
  abstract update(id: string, item: Partial<InvitationTemplate>): Promise<InvitationTemplate | null>;
  abstract remove(id: string): Promise<void>;
}
