import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '사용자명',
    example: 'jake',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '사용자 이메일',
    example: 'jake@jake.jake',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: '사용자 비밀번호',
    example: '12345678',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
