import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePackDto } from './create-pack.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdatePackDto extends PartialType(CreatePackDto) {
    
        @IsString()
        @IsNotEmpty()
        @ApiProperty({ example: 'Basic pack', description: 'titre de pack' })
        title : string;
    
        @IsString()
        @IsNotEmpty()
        @ApiProperty({ example: 'Access to limited features', description: 'Description de pack' })
        description : string;
    
    
        @IsNumber()
        @IsNotEmpty()
        @ApiProperty({ example: 20.55, description: 'prix de pack' })
        price : number
        @IsNumber()
        @IsNotEmpty()
        @ApiProperty({ example:8, description: 'nombre de pannaux du pack' })
        panels : number
        @IsNumber()
        @IsNotEmpty()
        @ApiProperty({ example: 200, description: 'energie générée par ce pack pack' })
        generated : number
        @IsNumber()
        @IsNotEmpty()
        @ApiProperty({ example: 300, description: 'énérgie gagné grace à ce pack' })
        gain : number
        @IsNumber()
        @IsNotEmpty()
        @ApiProperty({ example: 200, description: 'énérgie fossile évitée grace à ce pack' })
        fossil : number
}
