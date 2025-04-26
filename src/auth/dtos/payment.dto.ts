import { IsEmail, IsNumber, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class Payment {


  @IsNumber()
  @ApiProperty({ example: 20, description: 'Montant de paiement' })
  amount: number;

  @IsString()
  @ApiProperty({ example: 'TDN', description: 'Montant de paiement' })
  currency: string;

  @ApiProperty({ example: '1023456f7897765', description: 'Montant de paiement' })
  pendingSignupId: string;
}
