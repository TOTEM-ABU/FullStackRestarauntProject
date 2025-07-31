import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { IsEnum, IsPhoneNumber, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: RoleType })
  @IsEnum(RoleType)
  role: RoleType;

  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty()
  @IsUUID()
  regionId: string;
}
