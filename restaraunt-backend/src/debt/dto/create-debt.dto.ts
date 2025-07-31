import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Min, IsOptional, IsString } from 'class-validator';

export class CreateDebtDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;
}
