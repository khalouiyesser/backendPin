import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import {ApiProperty} from "@nestjs/swagger";


export class CreateProfileDto {


    @ApiProperty({ example: 'john', description: 'Nom de l\'utilisateur' })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsOptional()
    @ApiProperty({ example: 'https://img.freepik.com/vecteurs-libre/cercle-bleu-utilisateur-blanc_78370-4707.jpg?t=st=1740914593~exp=1740918193~hmac=136243d33c1c0136b97b19d21e12b3adc837e429b9624fc453672c23eb358f61&w=740', description: 'le lien de l\'image'})
    image?: string;
    
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ example: '123345678978585', description: 'ID d\'un utilisateur'})
    userId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '123345678978585', description: 'ID de pack'})
    packId: string;
    
}
