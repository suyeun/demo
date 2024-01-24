import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendPushDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => Date)
  scheduleTime!: Date;
}
