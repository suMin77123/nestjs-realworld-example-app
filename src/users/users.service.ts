/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import bcrypt from 'node_modules/bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = this.users.find((user) => user.email === createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in exists');
    }

    const existingUsername = this.users.find((user) => user.username === createUserDto.username);
    if (existingUsername) {
      throw new ConflictException('Username already in exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser: User = {
      id: this.nextId++,
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      bio: '',
      image: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    const { password, ...userResponse } = newUser;

    return userResponse;
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.users.map((user) => {
      const { password, ...userResponse } = user;
      return userResponse;
    });
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      this.users[userIndex].email = updateUserDto.email;
    }

    if (updateUserDto.username) {
      this.users[userIndex].username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      this.users[userIndex].password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.bio !== undefined) {
      this.users[userIndex].bio = updateUserDto.bio;
    }

    if (updateUserDto.image !== undefined) {
      this.users[userIndex].image = updateUserDto.image;
    }

    this.users[userIndex].updatedAt = new Date();

    const { password, ...userResponse } = this.users[userIndex];

    return userResponse;
  }

  async remove(id: number): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
  }
}
