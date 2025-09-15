import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('username') username: string): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(username);
  }
}
