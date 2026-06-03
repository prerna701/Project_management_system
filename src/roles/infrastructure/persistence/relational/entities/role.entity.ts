import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'roles' })
export class RoleEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, example: 'Admin' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ type: String, example: 'admin' })
  @Column({ type: 'varchar', nullable: true })
  slug?: string;
}
