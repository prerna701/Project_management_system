import { ReleaseNote } from '../../domain/release-note';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class ReleaseNotesRepository {
  abstract findById(id: string): Promise<ReleaseNote | null>;
  abstract findByProject(
    projectId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ReleaseNote[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<ReleaseNote>): Promise<ReleaseNote>;
}
