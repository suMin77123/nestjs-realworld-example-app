/* eslint-disable @typescript-eslint/require-await */
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: UserResponseDto;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '사용자 로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            token: { type: 'string' },
            username: { type: 'string' },
            bio: { type: 'string' },
            image: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '잘못된 인증 정보',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: '사용자 등록', description: '새로운 사용자를 등록합니다.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            token: { type: 'string' },
            username: { type: 'string' },
            bio: { type: 'string' },
            image: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일 또는 사용자명',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: 'JWT 토큰으로 현재 로그인한 사용자 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            username: { type: 'string' },
            bio: { type: 'string' },
            image: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  async getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '사용자 로그아웃',
    description: 'JWT 토큰을 무효화하여 로그아웃합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 요청',
  })
  async logout(@Request() req: AuthenticatedRequest) {
    const token = this.extractTokenFromHeader(req);
    if (token) {
      await this.authService.logout(token);
    }
    return { message: '로그아웃 되었습니다.' };
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  @Get('redis-test')
  @ApiOperation({ summary: 'Redis 연결 테스트', description: 'Redis 연결 상태를 확인합니다.' })
  async redisTest() {
    try {
      await this.authService.testRedisConnection();
      return { status: 'success', message: 'Redis 연결 성공!' };
    } catch (error) {
      return { status: 'error', message: 'Redis 연결 실패', error: error.message };
    }
  }
}
