import { IsNumber } from 'class-validator';

export class RegisterStudentDto {
  @IsNumber()
  studentId: number;
}
