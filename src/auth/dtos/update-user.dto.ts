import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {


    @IsString()
    @IsOptional()
    id?: string;
    
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string; 

    @IsString()
    @IsOptional()
    phoneNumber?: string;
}