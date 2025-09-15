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
    const profile = await this.profilesRepository.findOne({ where: { username } });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
