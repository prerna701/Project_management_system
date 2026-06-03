import { Module } from '@nestjs/common';
import { InvitationTemplatesController } from './invitation-templates.controller';
import { InvitationTemplatesService } from './invitation-templates.service';
import { RelationalInvitationTemplatesPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [RelationalInvitationTemplatesPersistenceModule, MailerModule],
  controllers: [InvitationTemplatesController],
  providers: [InvitationTemplatesService],
  exports: [InvitationTemplatesService],
})
export class InvitationTemplatesModule {}
