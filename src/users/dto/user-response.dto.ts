export class UserResponseDto {
  id: number;
  email: string;
  username: string;
  bio?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
