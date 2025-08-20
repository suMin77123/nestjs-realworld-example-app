import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 255 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
