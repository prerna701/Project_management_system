import { ReleaseNote } from '../../../../domain/release-note';
import { ReleaseNoteEntity } from '../entities/release-note.entity';

export class ReleaseNoteMapper {
  static toDomain(raw: ReleaseNoteEntity): ReleaseNote {
    const item = new ReleaseNote();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.title = raw.title;
    item.version = raw.version;
    item.description = raw.description;
    item.items = raw.items;
    item.releasedAt = raw.releasedAt;
    item.createdBy = raw.createdBy;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    return item;
  }

  static toPersistence(item: Partial<ReleaseNote>): Partial<ReleaseNoteEntity> {
    const entity: Partial<ReleaseNoteEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.title !== undefined) entity.title = item.title;
    if (item.version !== undefined) entity.version = item.version;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.items !== undefined) entity.items = item.items;
    if (item.releasedAt !== undefined) entity.releasedAt = item.releasedAt ?? null;
    if (item.createdBy !== undefined) entity.createdBy = item.createdBy;
    return entity;
  }
}
