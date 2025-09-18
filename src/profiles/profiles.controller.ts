import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

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
  async getProfile(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.getProfile(username, req.user.id);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팔로우', description: '사용자를 팔로우합니다.' })
  @ApiParam({ name: 'username', description: '사용자명', example: 'jake' })
  async followUser(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.followUser(username, req.user.id);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '언팔로우', description: '사용자를 언팔로우합니다.' })
  @ApiParam({ name: 'username', description: '사용자명', example: 'jake' })
  async unfollowUser(
    @Param('username') username: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profilesService.unfollowUser(username, req.user.id);
  }
}
