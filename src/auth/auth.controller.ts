import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MailService } from '../services/mail.service';
import {ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { LoginGoogleDto } from './dtos/google.dto';
import { Payment } from './dtos/payment.dto';
import {ProfileService} from "../profile/profile.service";
import { UpdateProfileDto } from './dtos/update-user.dto';
import { log } from 'console';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private mailService: MailService,
              private profileService: ProfileService,) {}



  @ApiOperation({ summary: 's\'inscrire 1er étape' })
  @Post('signup')
  async signUp(@Body() signupData: SignupDto) {
    console.log(signupData)
    return this.authService.signup(signupData);
  }


  @Patch(':id/wallet')
  async updateWallet(
    @Param('id') userId: string,
    @Body('wallet') wallet: string,
  ) {
    return this.authService.updateWallet(userId, wallet);
  }

  @ApiOperation({ summary: 'confirmer leur s\'inscrire avec un e-mail ' })
  @Get('verify-email')
  async verifyEmail(
    @Query('id') pendingSignupId: string,
    @Query('token') token: string,
  ) {
    return this.authService.verifyEmail(pendingSignupId, token);
  }


  @ApiOperation({ summary: 'modifier le pack au cours de s\'inscrire  ' })
  @Patch('pending-signup/:id/pack/:packId')
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de pending-signup' })
  @ApiParam({ name: 'packId', example: '123222ss2s2s2', description: 'ID de pack' })
  async updatePendingSignupPack(
    @Param('id') pendingSignupId: string,
    @Param('packId') packId: string
  ) {
    return this.authService.updatePendingSignupPack(pendingSignupId, packId);
  }

  @ApiOperation({ summary: 'complèter l\'inscription totale ' })
  @Patch('finalize-signup/:pendingSignupId')
  @ApiParam({ name: 'pendingSignupId', example: '123222ss2s2s2', description: 'ID de pending-signup' })
  async finalizeSignup(@Param('pendingSignupId') pendingSignupId: string) {
    return this.authService.finalizeSignup(pendingSignupId);
  }


  @ApiOperation({ summary: 's\'inscrire avec google' })
  @Post('signupGoogle')
  async signUpGoogle(@Body() signupData: SignupDto) {
    console.log(signupData);
    return this.authService.signupGoogle(signupData);
  }


  @ApiOperation({ summary: 's\'authentifier simple' })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    console.log(credentials);
    return this.authService.login(credentials);
  }
  @ApiOperation({ summary: 's\'authentifier avec Google' })
  @Post('loginGoogle')
  async loginGoogle(@Body() credentials: LoginGoogleDto) {
    return this.authService.loginWithGoogle(credentials);
  }



  @ApiOperation({ summary: 'refresh token' })
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }


  @Put('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    console.log('Données reçues:', changePasswordDto);
    return this.authService.changePassword(
      changePasswordDto.userId, // Utiliser user_id du body
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  //@UseGuards(AuthenticationGuard) // Utiliser le guard d'authentification pour obtenir l'utilisateur connecté
  @Patch('update-user') 
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    //@Req() req
  ) {


    log("shaymouta")
    log(updateProfileDto)
    return this.authService.updateUserProfile(updateProfileDto);
  }


  @ApiOperation({ summary: 'mot de passe oublié' })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log("111");
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({ summary: 'reset password' })
  @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }

  @ApiOperation({ summary: 'les détails d\'un utilisateur' })
  @Get('user/:id')
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de l\'utilisateur' })
  async getUserDetails(@Param('id') id: string) {
    const user = await this.authService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
/*
  @ApiOperation({ summary: 'supprimer un utilisateur avec ses profiles' })
  @Delete('deleteUser/:id')
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de l\'utilisateur' })
  async deleteUser(@Param('id') id: string) {
    const user = await this.authService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    for (const profile of user.profiles) {
      await this.profileService.deleteProfile(profile.toString());
    }

    return await this.authService.deleteUser(user.id);
  }
*/
}
