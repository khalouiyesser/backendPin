import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import { SignupDto } from 'src/auth/dtos/signup.dto';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}


 
}
