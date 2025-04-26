import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Profile } from './entities/profile.entity';
import { Model, Types } from 'mongoose';
import {ApiOperation, ApiParam, ApiTags} from "@nestjs/swagger";


@ApiTags('Gestion des profiles')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @ApiOperation({ summary: 'créer un profile' })
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'récupérer tous les profiles' })
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'récupérer un profile' })
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de profile' })
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'récupérer les profiles d\'un seul utilisateur' })
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID d\'utilisateur' })
  findByUserId(@Param('userId') userId: string) {
    return this.profileService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'modifier un profile' })
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de profile' })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, updateProfileDto);
  }


}
