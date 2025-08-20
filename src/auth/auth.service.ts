/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      user: {
        email: user.email,
        token: this.jwtService.sign(payload),
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
      return {
        user: {
          email: user.email,
          token: this.jwtService.sign(payload),
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
      const decoded: any = this.jwtService.decode(token);
      if (decoded?.exp && typeof decoded.exp === 'number') {
        const expiresAt = decoded.exp * 1000;
        const currentTime = Date.now();
        const ttl = Math.max(0, expiresAt - currentTime);

        if (ttl > 0) {
          await this.cacheManager.set(`blacklist:${token}`, 'true', ttl);
        }
      }
    } catch (error) {
      // 로그아웃 실패 시 무시
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const result = await this.cacheManager.get(`blacklist:${token}`);
      return result === 'true';
    } catch (error) {
      return false;
    }
  }
}
