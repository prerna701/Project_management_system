import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { ProjectEntity } from '../../../projects/infrastructure/persistence/relational/entities/project.entity';
// import { ProjectStatus } from '../../../projects/enums/project-status.enum';
// import { ProjectPriority } from '../../../projects/enums/project-priority.enum';
// import { ProjectVisibility } from '../../../projects/enums/project-visibility.enum';
import {ProjectEntity} from 'src/projects/infrastructure/persistence/relational/entities/project.entity';
import { ProjectStatus } from 'src/projects/enums/project-status.enum';
import { ProjectPriority } from 'src/projects/enums/project-priority.enum';
import { ProjectVisibility } from 'src/projects/enums/project-visibility.enum';

const PROJECTS: Partial<ProjectEntity>[] = [
  {
    name: 'ViewRay Project',
    code: 'VR-001',
    description: 'Main ViewRay product development',
    clientName: 'ViewRay Inc',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    priority: ProjectPriority.FOUNDATION ,
    visibility: ProjectVisibility.PRIVATE,
    status: ProjectStatus.ACTIVE,
    isBillable: true,
    estimatedHours: 500,
    budget: 50000,
    tags: [
      { id: '1', label: 'development', color: '#0052CC' },
      { id: '2', label: 'priority', color: '#FF6B6B' },
    ],
  },
  {
    name: 'ServiceDesk Project',
    code: 'SD-001',
    description: 'Service desk management system',
    clientName: 'Internal IT',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    priority: ProjectPriority.FOUNDATION,
    visibility: ProjectVisibility.PRIVATE,
    status: ProjectStatus.ACTIVE,
    isBillable: false,
    estimatedHours: 300,
    budget: 30000,
    tags: [
      { id: '3', label: 'internal', color: '#52C41A' },
      { id: '4', label: 'infrastructure', color: '#FA8C16' },
    ],
  },
];

@Injectable()
export class ProjectSeedService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  async run(): Promise<string[]> {
    const createdProjectIds: string[] = [];

    for (const project of PROJECTS) {
      const existing = await this.projectRepo.findOne({
        where: { code: project.code as string},
      });

      if (!existing) {
        const created = await this.projectRepo.save(
          this.projectRepo.create(project),
        );
        createdProjectIds.push(created.id);
      } else {
        createdProjectIds.push(existing.id);
      }
    }

    return createdProjectIds;
  }
}
