import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async getProfile(username: string): Promise<ProfileResponseDto> {
    const profile = await this.profilesRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.username = :username', { username })
      .getOne();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: profile.id,
      username: profile.user.username,
      bio: profile.bio,
      image: profile.image,
      following: profile.following,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
