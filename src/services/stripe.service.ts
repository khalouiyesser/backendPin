
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async createPaymentIntent(amount: number, currency: string): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convertir en cents
        currency,
        payment_method_types: ['card'],
      });
      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Erreur Stripe:', error);
      throw new Error('Erreur lors de la création du paiement');
    }
  }
}
