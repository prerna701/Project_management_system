import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationTemplateEntity } from './entities/invitation-template.entity';
import { InvitationTemplatesRepository } from '../invitation-templates.repository';
import { RelationalInvitationTemplatesRepository } from './repositories/invitation-templates.repository';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTemplateEntity])],
  providers: [
    { provide: InvitationTemplatesRepository, useClass: RelationalInvitationTemplatesRepository },
  ],
  exports: [InvitationTemplatesRepository],
})
export class RelationalInvitationTemplatesPersistenceModule {}
