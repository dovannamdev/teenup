import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  day_of_week: string;

  @IsString()
  @IsNotEmpty()
  time_slot: string;

  @IsString()
  @IsNotEmpty()
  teacher_name: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  max_students?: number;
}
