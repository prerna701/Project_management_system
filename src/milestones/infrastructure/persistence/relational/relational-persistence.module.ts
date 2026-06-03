import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilestoneEntity } from './entities/milestone.entity';
import { MilestonesRepository } from '../milestones.repository';
import { RelationalMilestonesRepository } from './repositories/milestones.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MilestoneEntity])],
  providers: [
    { provide: MilestonesRepository, useClass: RelationalMilestonesRepository },
  ],
  exports: [MilestonesRepository],
})
export class RelationalMilestonesPersistenceModule {}
