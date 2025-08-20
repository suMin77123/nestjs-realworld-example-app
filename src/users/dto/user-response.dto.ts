import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'jake@jake.jake',
  })
  email: string;

  @ApiProperty({
    description: '사용자명',
    example: 'jake',
  })
  username: string;

  @ApiPropertyOptional({
    description: '사용자 자기소개',
    example: 'I work at statefarm',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/avatar.jpg',
  })
  image?: string;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '정보 수정 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
