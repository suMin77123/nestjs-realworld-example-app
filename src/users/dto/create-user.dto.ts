import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자명',
    example: 'jake',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'jake@jake.jake',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호',
    example: '12345678',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
