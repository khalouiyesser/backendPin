import { Controller, Post, Put, Param, Body, Get } from '@nestjs/common';
import { SurplusService } from './surplus.service';
import { CreateSurplusDto } from './dto/create-surplus.dto';
import { Surplus } from './entities/surplus.entity';
import {ApiBody, ApiOperation, ApiParam, ApiTags} from "@nestjs/swagger";


@ApiTags('Gestion d\'énergie')
@Controller('surplus')
export class SurplusController {
  constructor(private readonly surplusService: SurplusService) {}
  
  //create user suplus for each bureau 
  @ApiOperation({ summary: 'créer le surplus de charge pour un client' })
  @Post(':userId')
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de client' })
  async createSurplus(
    @Param('userId') userId: string,
    @Body() surplusData: CreateSurplusDto,
  ): Promise<Surplus> {
    return this.surplusService.createSurplus(userId, surplusData);
  }
//update the user surplus  value 
  @ApiOperation({ summary: 'modifier le surplus de charge d\'un client' })
  @Put(':userId')
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de client' })
  async updateSurplusAmount(
    @Param('userId') userId: string,
    @Body() updateData: CreateSurplusDto,
  ): Promise<Surplus> {
    return this.surplusService.updateSurplusAmount(userId, updateData);
  }

//get user suplus value
  @ApiOperation({ summary: 'récupérer le surplus de charge pour un client' })
  @Get(':userId')
  @ApiParam({ name: 'id', example: '123222ss2s2s2s2' , description: 'ID de client' })
  async getUserSurpluses(@Param('userId') userId: string): Promise<Surplus[]> {
    return this.surplusService.getUserSurpluses(userId);
  }

  @Post('transfer/:userId')
  @ApiOperation({ summary: 'transfère d\'énrgie' })
  @ApiParam({ name: 'id', example: '123222ss2s2s2s2' , description: 'ID de client' })
  @ApiBody({
    schema: {
      properties: {
        quantity: {
          type: 'string',
          example: '10 W',
          description: 'Quantité d\'énergie à transférer'
        }
      }
    }
  })

  async transferSurplus(
    @Param('userId') userId: string,
    @Body('quantite') quantite: number
  ): Promise<any> {
    try {
      console.log("thus fuction is invoxked")
      // Call the Transfert function from the service
      const result = await this.surplusService.Transfert(userId, quantite);
      return result; // Return the result of the transfer
    } catch (error) {
      throw new Error(`Error during surplus transfer: ${error.message}`);
    }
  }
}
