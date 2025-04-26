import { IsEmail, IsMongoId, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class SignupDto {


  @IsString()
  @ApiProperty({ example: 'john', description: 'Nom de l\'utilisateur' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'doe', description: 'Prénom de l\'utilisateur' })
  lastName: string;

  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email de l\'utilisateur' })
  email: string;



  @IsString()
  @IsOptional()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @ApiProperty({ example: 'JohnDoe123', description: 'Mot de passe', minLength: 6 })
  password: string;


  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg?t=st=1740914593~exp=1740918193~hmac=136243d33c1c0136b97b19d21e12b3adc837e429b9624fc453672c23eb358f61&w=740', description: 'le lien de l\'image'})
  photoUrl : string


  @IsString()
  @IsOptional()
  @ApiProperty({ example: '21234567', description: 'Numéro de téléphone' })
  phoneNumber : string

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '123345678978585', description: 'ID google' })
  idGoogle: string;

  @IsMongoId()
  @IsOptional()
  @ApiProperty({ example: '123345678978585', description: 'ID de pack'})
  packId?: string;

}
