import { Controller, Post, Patch, Get, Delete, Body, Param, Query, NotFoundException, Res } from '@nestjs/common';
import { PackService } from './pack.service';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { MailService } from '../services/mail.service';
import { Response } from 'express';

@ApiTags('Gestion des packs')
@Controller('packs')
export class PackController {
  constructor(private readonly packService: PackService,
    private readonly mailService: MailService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pack' })
  async createPack(@Body() createPackDto: CreatePackDto) {
    return this.packService.createPack(
      createPackDto.title,
      createPackDto.description,
      createPackDto.price,
      createPackDto.panels,
      createPackDto.generated,
      createPackDto.gain,
      createPackDto.fossil,
      createPackDto.stripePriceId,
      createPackDto.durationMonths
    );
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les packs' })
  async getAllPacks() {
    return this.packService.getAllPacks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un pack par ID' })
  @ApiParam({ name: 'id', example: '67c3a54219a227df76c6b67c', description: 'ID du pack' })
  async getPack(@Param('id') id: string) { 
    return this.packService.getPack(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un pack' })
  @ApiParam({ name: 'id', example: '67c3a54219a227df76c6b67c', description: 'ID du pack' })
  async updatePack(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    return this.packService.updatePack(
      id,
      updatePackDto.title,
      updatePackDto.description,
      updatePackDto.price,
      updatePackDto.panels,
      updatePackDto.generated,
      updatePackDto.gain,
      updatePackDto.fossil
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un pack' })
  @ApiParam({ name: 'id', example: '67c3a54219a227df76c6b67c', description: 'ID du pack' })
  async deletePack(@Param('id') id: string) {
    return this.packService.deletePack(id);
  }


   /**
   * Confirmation de paiement et envoi de l'email de confirmation avec les détails du pack.
   * On passe en paramètre l'ID du pack et les données utilisateur (email et userName).
   */
   @Post('confirm/:id')
   @ApiOperation({ summary: 'Confirmer la sélection d\'un pack et envoyer un email avec les données du pack' })
   @ApiParam({ name: 'id', example: '67c3a54219a227df76c6b67c', description: 'ID du pack' })
   async confirmPackSelection(
     @Param('id') packId: string,
     @Body() userData: { email: string; userName: string }
   ) {
     // Récupérer les détails du pack à partir de son ID
     const pack = await this.packService.getPack(packId);
     if (!pack) {
       throw new NotFoundException('Pack not found');
     }
 
     // Appel de la fonction d'envoi d'email en injectant les détails du pack
     await this.mailService.sendSignupConfirmationEmail(userData.email, userData.userName, pack);
 
     // Retourne une réponse avec confirmation et le lien de la page de confirmation PDF
     const pdfUrl = `/packs/confirmation-pdf/${packId}?userName=${encodeURIComponent(userData.userName)}`;
     return {
       success: true,
       message: 'Email de confirmation envoyé avec succès',
       pdfUrl: pdfUrl
     };
   }
 
   // Téléchargement du PDF de confirmation du pack
   @Get('confirmation-pdf/:id')
   @ApiOperation({ summary: 'Télécharger le PDF de confirmation du pack' })
   @ApiParam({ name: 'id', example: '67c3a54219a227df76c6b67c', description: 'ID du pack' })
   @ApiQuery({ name: 'userName', required: false, description: 'Nom de l\'utilisateur' })
   async getPackConfirmationPdf(
     @Param('id') packId: string,
     @Query('userName') userName: string,
     @Res() res: Response
   ) {
     // Récupérer les détails du pack
     const pack = await this.packService.getPack(packId);
     if (!pack) {
       throw new NotFoundException('Pack not found');
     }
 
     // Construction du contenu HTML dynamique pour la confirmation du pack
     res.set({ 'Content-Type': 'text/html' });
 
     const htmlContent = `...`  // Le code HTML reste inchangé, comme fourni précédemment
 
     return res.send(htmlContent);
   }
 
}
