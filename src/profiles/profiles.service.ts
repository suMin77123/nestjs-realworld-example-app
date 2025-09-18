import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getProfile(username: string, currentUserId?: number): Promise<ProfileResponseDto> {
    const profile = await this.profilesRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('user.username = :username', { username })
      .getOne();

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    let isFollowing = false;
    if (currentUserId) {
      const currentUser = await this.usersRepository.findOne({
        where: { id: currentUserId },
        relations: ['following'],
      });
      if (currentUser) {
        isFollowing = currentUser.following.some((user) => user.id === profile.user.id);
      }
    }

    return {
      id: profile.id,
      username: profile.user.username,
      bio: profile.bio,
      image: profile.image,
      following: isFollowing,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async followUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const currentUser = await this.usersRepository.findOne({
      where: { id: currentUserId },
      relations: ['following'],
    });

    const targetUser = await this.usersRepository.findOne({
      where: { username },
      relations: ['followers'],
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (currentUser.following.some((user) => user.id === targetUser.id)) {
      throw new ConflictException('Already following this user');
    }

    currentUser.following.push(targetUser);
    await this.usersRepository.save(currentUser);

    return this.getProfile(username, currentUserId);
  }

  async unfollowUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const currentUser = await this.usersRepository.findOne({
      where: { id: currentUserId },
      relations: ['following'],
    });

    const targetUser = await this.usersRepository.findOne({
      where: { username },
      relations: ['followers'],
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (!currentUser.following.some((user) => user.id === targetUser.id)) {
      throw new ConflictException('Not following this user');
    }

    currentUser.following = currentUser.following.filter((user) => user.id !== targetUser.id);
    await this.usersRepository.save(currentUser);

    return this.getProfile(username, currentUserId);
  }
}
