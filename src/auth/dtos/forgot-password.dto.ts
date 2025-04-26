import { IsEmail } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email de l\'utilisateur' })
  email: string;
}
