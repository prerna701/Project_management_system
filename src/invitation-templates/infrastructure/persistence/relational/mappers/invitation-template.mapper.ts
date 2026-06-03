import { InvitationTemplate } from '../../../../domain/invitation-template';
import { InvitationTemplateEntity } from '../entities/invitation-template.entity';

export class InvitationTemplateMapper {
  static toDomain(raw: InvitationTemplateEntity): InvitationTemplate {
    const item = new InvitationTemplate();
    item.id = raw.id;
    item.name = raw.name;
    item.userType = raw.userType;
    item.subject = raw.subject;
    item.content = raw.content;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<InvitationTemplate>): Partial<InvitationTemplateEntity> {
    const entity: Partial<InvitationTemplateEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.name !== undefined) entity.name = item.name;
    if (item.userType !== undefined) entity.userType = item.userType;
    if (item.subject !== undefined) entity.subject = item.subject;
    if (item.content !== undefined) entity.content = item.content;
    return entity;
  }
}
