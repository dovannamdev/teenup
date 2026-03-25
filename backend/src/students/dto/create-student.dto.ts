import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  dob: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  current_grade: string;

  @IsNumber()
  parentId: number;
}
