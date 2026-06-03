import { Injectable, NotFoundException } from '@nestjs/common';
import { InvitationTemplatesRepository } from './infrastructure/persistence/invitation-templates.repository';
import { InvitationTemplate } from './domain/invitation-template';
import { CreateInvitationTemplateDto } from './dto/create-invitation-template.dto';
import { UpdateInvitationTemplateDto } from './dto/update-invitation-template.dto';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class InvitationTemplatesService {
  constructor(
    private readonly repository: InvitationTemplatesRepository,
    private readonly mailerService: MailerService,
  ) {}

  async findAll(
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: InvitationTemplate[]; meta: PaginationMetaDto }> {
    return this.repository.findAll({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findById(id: string): Promise<InvitationTemplate> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Invitation template #${id} not found`);
    return item;
  }

  async create(dto: CreateInvitationTemplateDto): Promise<InvitationTemplate> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateInvitationTemplateDto): Promise<InvitationTemplate> {
    const item = await this.repository.update(id, dto);
    if (!item) throw new NotFoundException(`Invitation template #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }

  async send(templateId: string, dto: SendInvitationDto): Promise<void> {
    const template = await this.findById(templateId);
    const subject = dto.subject ?? template.subject;
    let content = dto.content ?? template.content;

    if (dto.recipientName) {
      content = content.replace(/\{\{name\}\}/gi, dto.recipientName);
    }

    await this.mailerService.sendMail({ to: dto.to, subject, html: content });
  }
}
