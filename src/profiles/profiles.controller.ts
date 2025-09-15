import { Controller, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '프로필 조회', description: '사용자 프로필을 조회합니다.' })
  @ApiParam({ name: 'username', description: '사용자명', example: 'jake' })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '프로필을 찾을 수 없음',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  async getProfile(@Param('username') username: string): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(username);
  }
}
