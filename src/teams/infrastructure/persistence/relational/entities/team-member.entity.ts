import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'team_members' })
@Index(['teamId', 'userId'])
export class TeamMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  teamRole: string | null;

  @Column({ type: 'uuid', nullable: true })
  reportingManagerId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  joinedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  leftAt: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
