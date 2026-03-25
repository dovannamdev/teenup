import { IsString, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  studentId: number;

  @IsString()
  @IsNotEmpty()
  package_name: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsNumber()
  @Min(1)
  total_sessions: number;
}
