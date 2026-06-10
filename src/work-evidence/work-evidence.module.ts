import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitCommitActivityEntity } from './infrastructure/entities/git-commit-activity.entity';
import { GitIntegrationEntity } from './infrastructure/entities/git-integration.entity';
import { ProjectRepositoryEntity } from './infrastructure/entities/project-repository.entity';
import { TimeLogEvidenceAssessmentEntity } from './infrastructure/entities/time-log-evidence-assessment.entity';
import { UserGitIdentityEntity } from './infrastructure/entities/user-git-identity.entity';
import { WorkEvidenceController } from './work-evidence.controller';
import { WorkEvidenceService } from './work-evidence.service';
import { WorkTimeCalculatorService } from './work-time-calculator.service';
import { WorkActivityEventEntity } from './infrastructure/entities/work-activity-event.entity';
import { EvidenceProviderResultEntity } from './infrastructure/entities/evidence-provider-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GitIntegrationEntity,
      ProjectRepositoryEntity,
      UserGitIdentityEntity,
      GitCommitActivityEntity,
      TimeLogEvidenceAssessmentEntity,
      WorkActivityEventEntity,
      EvidenceProviderResultEntity,
    ]),
  ],
  controllers: [WorkEvidenceController],
  providers: [WorkEvidenceService, WorkTimeCalculatorService],
  exports: [WorkEvidenceService],
})
export class WorkEvidenceModule {}
