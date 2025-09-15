import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import * as bcrypt from 'bcryptjs';

interface JwtPayload {
  email: string;
  sub: number;
  exp?: number;
  iat?: number;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private redisClient: RedisClientType;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initRedis();
  }

  private async initRedis() {
    this.redisClient = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(this.configService.get('REDIS_PORT', '6379')),
      },
      database: parseInt(this.configService.get('REDIS_DB', '0')),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    });

    this.redisClient.on('error', (err) => console.error('Redis 클라이언트 오류:', err));
    this.redisClient.on('connect', () => console.log('✅ Redis 연결 성공!'));
    this.redisClient.on('ready', () => console.log('✅ Redis 클라이언트 준비 완료!'));

    try {
      await this.redisClient.connect();
      console.log('✅ Redis 연결 및 초기화 완료!');
    } catch (error) {
      console.error('💥 Redis 연결 실패:', error);
    }
  }

  private async ensureRedisConnection(): Promise<boolean> {
    try {
      if (!this.redisClient.isOpen) {
        console.log('🔄 Redis 재연결 시도...');
        await this.redisClient.connect();
      }
      return true;
    } catch (error) {
      console.error('💥 Redis 연결 확인 실패:', error);
      return false;
    }
  }

  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const result = {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.removeUserTokens(user.id);

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    await this.storeUserToken(user.id, token);

    return {
      user: {
        email: user.email,
        token,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);

      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      await this.storeUserToken(user.id, token);

      return {
        user: {
          email: user.email,
          token,
          username: user.username,
          bio: user.bio,
          image: user.image,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode<JwtPayload>(token);
      if (decoded?.sub) {
        await this.removeUserTokens(decoded.sub);
      }
    } catch (error) {
      console.error('💥 로그아웃 중 오류:', error);
    }
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.decode<JwtPayload>(token);
      if (!decoded?.sub) {
        return false;
      }

      const storedToken = await this.redisClient.get(`user:${decoded.sub}:token`);
      return storedToken === token;
    } catch (error) {
      console.error('토큰 검증 중 오류:', error);
      return false;
    }
  }

  private async storeUserToken(userId: number, token: string): Promise<void> {
    try {
      const isConnected = await this.ensureRedisConnection();
      if (!isConnected) {
        console.error('💥 Redis 연결 실패로 토큰 저장 불가');
        return;
      }

      const decoded = this.jwtService.decode<JwtPayload>(token);
      console.log('🔑 토큰 디코딩 결과:', { userId, decoded });

      if (decoded?.exp && typeof decoded.exp === 'number') {
        const expiresAt = decoded.exp * 1000;
        const currentTime = Date.now();
        const ttl = Math.max(0, Math.floor((expiresAt - currentTime) / 1000));

        console.log('⏰ TTL 계산:', { expiresAt, currentTime, ttl });

        if (ttl > 0) {
          const key = `user:${userId}:token`;
          console.log('🔍 Redis 연결 상태:', this.redisClient.isOpen);

          await this.redisClient.setEx(key, ttl, token);
          console.log('✅ Redis에 토큰 저장 성공:', { key, ttl });

          const stored = await this.redisClient.get(key);
          console.log('🔍 저장 확인:', { stored: !!stored, storedValue: stored });
        } else {
          console.log('❌ TTL이 0 이하라서 저장하지 않음');
        }
      } else {
        console.log('❌ 토큰 디코딩 실패 또는 exp 없음');
      }
    } catch (error) {
      console.error('💥 토큰 저장 중 오류:', error);
    }
  }

  private async removeUserTokens(userId: number): Promise<void> {
    try {
      const key = `user:${userId}:token`;
      await this.redisClient.del(key);
      console.log('🗑️ Redis에서 토큰 삭제:', { key });
    } catch (error) {
      console.error('💥 토큰 삭제 중 오류:', error);
    }
  }

  async testRedisConnection(): Promise<void> {
    try {
      console.log('🔄 Redis 연결 테스트 시작...');
      await this.redisClient.setEx('test:connection', 5, 'success');
      const result = await this.redisClient.get('test:connection');
      console.log('✅ Redis 테스트 결과:', result);

      if (result !== 'success') {
        throw new Error('Redis 읽기/쓰기 실패');
      }
    } catch (error) {
      console.error('💥 Redis 연결 테스트 실패:', error);
      throw error;
    }
  }
}
