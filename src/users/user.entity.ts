import { Profile } from 'src/profiles/profile.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
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

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
