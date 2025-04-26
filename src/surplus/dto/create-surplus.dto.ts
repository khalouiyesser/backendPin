import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateSurplusDto {




  @IsString()
  @ApiProperty({ example: '20', description: 'La quantité d\'énergie disponible pour le transfert' })
  amount: string;


  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Indique si le processus de transfert est actif (true) ou inactif (false)' })
  state: boolean;


  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 12, description: 'Indique si le processus de transfert est actif (true) ou inactif (false)' })
  relay: number;
}
