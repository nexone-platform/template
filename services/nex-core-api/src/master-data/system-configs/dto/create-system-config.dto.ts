import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  systemKey: string;

  @IsString()
  @IsOptional()
  systemValue?: string;

  @IsString()
  @IsNotEmpty()
  systemType: string;

  @IsString()
  @IsOptional()
  systemGroup?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  systemSeqNo?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
