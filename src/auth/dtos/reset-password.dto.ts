import { IsString, Matches, MinLength } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ResetPasswordDto {
  @IsString()
  @ApiProperty({ example: '123456789987654321', description: 'reset token' })
  resetToken: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @ApiProperty({ example: 'JohnDoe123', description: 'Mot de passe', minLength: 6 })
  newPassword: string;
}
