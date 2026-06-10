import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeLogsRepository } from '../time-logs.repository';
import { TimeLogEntity } from './entities/time-log.entity';
import { RelationalTimeLogsRepository } from './repositories/time-logs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TimeLogEntity])],
  providers: [
    { provide: TimeLogsRepository, useClass: RelationalTimeLogsRepository },
  ],
  exports: [TimeLogsRepository],
})
export class RelationalTimeLogsPersistenceModule {}
