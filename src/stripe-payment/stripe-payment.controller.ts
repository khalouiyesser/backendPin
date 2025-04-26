import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  BadRequestException, 
  Headers, 
  Req, 
  RawBodyRequest,
  HttpStatus,
  Res,
  Query,
  Delete
} from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { Request, Response } from 'express';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripeService: StripePaymentService) {}

  @Post('/create-session')
  async createCheckoutSession(
    @Body() { 
      packId, 
      pendingSignupId, 
      email, 
      profileId 
    }: { 
      packId: string; 
      pendingSignupId: string;
      email: string;
      profileId: string;
    }
  ) {
    if (!packId || !pendingSignupId || !email || !profileId) {
      throw new BadRequestException('Pack ID, Pending Signup ID, Email, and Profile ID are required');
    }
    return this.stripeService.createCheckoutSession(packId, pendingSignupId, email, profileId);
  }

  @Get('/success')
  async handleSuccess(@Query('session_id') sessionId: string, @Query('profileId') profileId: string) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    return this.stripeService.handleSubscriptionSuccess(sessionId);
  }

  @Post('/webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response
  ) {
    if (!signature || !req.rawBody) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing stripe-signature header or raw body' });
    }

    try {
      const result = await this.stripeService.handleWebhookEvent(signature, req.rawBody);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  }

  @Get('/subscription-status/:profileId')
  async getSubscriptionStatus(@Param('profileId') profileId: string) {
    return this.stripeService.checkSubscriptionStatus(profileId);
  }

  @Get('payment-failure/:profileId')
  async getPaymentFailureDetails(@Param('profileId') profileId: string) {
    return this.stripeService.getPaymentFailureDetails(profileId);
  }

  @Post('/cancel-subscription/:profileId')
  async cancelSubscription(@Param('profileId') profileId: string) {
    return this.stripeService.cancelSubscription(profileId);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'effacer un profile' })
  @ApiParam({ name: 'id', example: '123222ss2s2s2', description: 'ID de profile' })
  remove(@Param('id') id: string) {
    return this.stripeService.remove(id);
  }

  @Post('update-card/:profileId')
  async updateCard(@Param('profileId') profileId: string) {
    return this.stripeService.createCardUpdateSession(profileId);
  }
}