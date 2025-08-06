import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  Matches,
  IsEnum,
} from 'class-validator';
import { RestaurantType } from '@prisma/client';

export class CreateRestarauntDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  regionId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tip: number;

  @ApiProperty({ enum: RestaurantType })
  @IsEnum(RestaurantType)
  type: RestaurantType;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty({
    example: '+998901234567',
  })
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak",
  })
  phone: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
