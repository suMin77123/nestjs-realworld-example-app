import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 등록', description: '새로운 사용자를 등록합니다.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '사용자 등록 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일 또는 사용자명',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: '모든 사용자 조회',
    description: '등록된 모든 사용자 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회', description: 'ID로 특정 사용자 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정', description: '특정 사용자의 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '사용자 삭제', description: '특정 사용자를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: 1 })
  @ApiResponse({
    status: 204,
    description: '사용자 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
