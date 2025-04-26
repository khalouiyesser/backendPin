import { IsEmail, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class LoginDto {



  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email de l\'utilisateur' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'JohnDoe123', description: 'Mot de passe'})
  password: string;
}
