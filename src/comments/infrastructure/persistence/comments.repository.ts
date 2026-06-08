import { Comment } from '../../domain/comment';
import { CommentableEntity } from '../../enums/commentable-entity.enum';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class CommentsRepository {
  abstract findById(id: string): Promise<Comment | null>;
  abstract findByEntity(options: {
    entityType: CommentableEntity;
    entityId: string;
    paginationOptions: IPaginationOptions;
    parentId?: string | null;
  }): Promise<{ items: Comment[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Comment>): Promise<Comment>;
  abstract update(id: string, item: Partial<Comment>): Promise<Comment | null>;
  abstract remove(id: string): Promise<void>;
}
