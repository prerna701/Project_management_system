import { Module } from '@nestjs/common';
import { ProjectSeedService } from './project-seed.service';
import { ProjectEntity } from 'src/projects/infrastructure/persistence/relational/entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity])],
  providers: [ProjectSeedService],
  exports: [ProjectSeedService],
})
export class ProjectSeedModule {}
