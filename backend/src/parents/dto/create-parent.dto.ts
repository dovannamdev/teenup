import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateParentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;
}
