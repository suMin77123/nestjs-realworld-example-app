import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'boolean', default: false })
  following: boolean;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
