import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  cloudUrl: string;

  @Column({ nullable: true })
  cloudPublicId: string;

  @Column({ default: 'local' })
  storageType: 'local' | 'cloud';

  @CreateDateColumn()
  createdAt: Date;
}