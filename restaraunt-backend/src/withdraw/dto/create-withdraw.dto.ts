import { ApiProperty } from '@nestjs/swagger';
import { WithdrawType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({ enum: WithdrawType, example: 'OUTCOME or INCOME' })
  @IsEnum(WithdrawType)
  type: WithdrawType;

  @ApiProperty()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
