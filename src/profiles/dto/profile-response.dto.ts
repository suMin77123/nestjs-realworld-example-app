import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '사용자명',
    example: 'jake',
  })
  username: string;

  @ApiPropertyOptional({
    description: '자기소개',
    example: 'I work at statefarm',
  })
  bio?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지',
    example: 'https://api.realworld.io/images/smiley-cyrus.jpg',
  })
  image?: string;

  @ApiProperty({
    description: '팔로잉 여부',
    example: false,
  })
  following: boolean;

  @ApiProperty({
    description: '프로필 생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '프로필 수정 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
