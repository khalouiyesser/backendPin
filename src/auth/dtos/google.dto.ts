import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginGoogleDto {

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  idGoogle: string;


}
