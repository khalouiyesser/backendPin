import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Pack } from 'src/pack/entities/pack.entity';
import { Profile } from 'src/profile/entities/profile.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

import Stripe from 'stripe';
@Injectable()
export class StripePaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripePaymentService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Pack.name) private readonly PackModel: Model<Pack>,
    @InjectModel(Profile.name) private readonly ProfileModel: Model<Profile>,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      this.logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
    });
    
    this.logger.log(`Stripe initialized with API version: 2025-01-27.acacia`);
  }

  // Vérifie si un client Stripe existe
  async verifyStripeCustomer(customerId: string): Promise<boolean> {
    try {
      await this.stripe.customers.retrieve(customerId);
      return true;
    } catch (error) {
      this.logger.warn(`Customer verification failed: ${error.message}`);
      return false;
    }
  }

  // Créer un client Stripe
async createStripeCustomer(email: string, name: string, profileId?: string): Promise<string> {
      try {
        this.logger.log(`Creating Stripe customer for profile: ${profileId || 'new profile'}`);
        
        const metadata = {
          source: 'Your App Name',
          createdAt: new Date().toISOString(),
        };
        
        // Si nous avons un profileId, l'ajouter aux métadonnées
        if (profileId) {
          metadata['profileId'] = profileId;
        }
        
        const customer = await this.stripe.customers.create({
          email,
          name,
          metadata,
        });
        
        this.logger.log(`Created Stripe customer: ${customer.id} for profile: ${profileId || 'new profile'}`);
        return customer.id;
      } catch (error) {
        this.logger.error(`Failed to create Stripe customer: ${error.message}`);
        throw new BadRequestException(`Failed to create Stripe customer: ${error.message}`);
      }
    }
  



// Cette méthode peut être conservée comme sauvegarde, mais elle sera moins utilisée
async getOrCreateCustomer(profileId: string, email: string, name: string): Promise<string> {
  const profile = await this.ProfileModel.findById(profileId);
  
  if (profile?.stripeCustomerId) {
    try {
      const customerExists = await this.verifyStripeCustomer(profile.stripeCustomerId);
      if (customerExists) {
        this.logger.log(`Using existing Stripe customer: ${profile.stripeCustomerId}`);
        return profile.stripeCustomerId;
      }
    } catch (error) {
      this.logger.warn(`Error verifying customer, will create new one: ${error.message}`);
    }
  }
  
  // Si le client n'existe pas ou est invalide, en créer un nouveau
  const newCustomerId = await this.createStripeCustomer(email, name);
  
  // Mettre à jour le profil avec le nouvel ID client
  await this.ProfileModel.findByIdAndUpdate(profileId, {
    stripeCustomerId: newCustomerId
  });
  
  return newCustomerId;
}

  // Gérer le succès de la création d'abonnement
  
  async createCheckoutSession(packId: string, pendingSignupId: string, email: string, profileId: string) {
    try {
      // Récupérer les informations du pack depuis la base de données
      const pack = await this.PackModel.findById(packId);
      if (!pack) {
        throw new BadRequestException('Pack not found');
      }

      // Vérifier si le pack a un priceId pour Stripe
      if (!pack.stripePriceId) {
        throw new BadRequestException('Stripe Price ID is missing for the pack');
      }

      // Récupérer le profile
      const profile = await this.ProfileModel.findById(profileId);
      if (!profile) {
        throw new BadRequestException('Profile not found');
      }

      // Vérifier que le profil a un Customer ID Stripe
      if (!profile.stripeCustomerId) {
        throw new BadRequestException('No Stripe customer ID found for this profile');
      }

      // Calculer le nombre de mois attendus pour l'abonnement
      const expectedPayments = pack.durationMonths || 1;

      // Mettre à jour le profil avec les informations d'abonnement attendues
      await this.ProfileModel.findByIdAndUpdate(profileId, {
        expectedPayments,
        subscriptionStatus: 'incomplete',
      });

      this.logger.log(`Creating checkout session for profile: ${profileId}, pack: ${packId}`);
      
      // Créer la session de paiement Stripe avec le customer ID spécifique au profil
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: profile.stripeCustomerId, // Utiliser le customer ID spécifique au profil
        line_items: [
          {
            price: pack.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/stripe-payment/success?session_id={CHECKOUT_SESSION_ID}&profileId=${profileId}`,
        cancel_url: `${process.env.FRONTEND_URL}/stripe-payment/cancel`,
        metadata: {
          pendingSignupId,
          packId,
          profileId,
        },
        subscription_data: {
          metadata: {
            profileId, // S'assurer que le profileId est dans les métadonnées de l'abonnement
            packId,
          },
        },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`);
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }

  async createProfileWithStripeCustomer(userId: string, name: string, email: string, packId: string): Promise<Profile> {
    try {
      // Créer un nouveau customer ID pour ce profile spécifique
      const stripeCustomerId = await this.createStripeCustomer(email, name);
      
      // Créer le nouveau profile avec son customer ID unique
      const newProfile = new this.ProfileModel({
        name,
        userId: new Types.ObjectId(userId),
        packId: new Types.ObjectId(packId),
        stripeCustomerId, // Chaque profile a son propre customer ID
        subscriptionStatus: 'incomplete',
        isBlocked: true, // Bloqué jusqu'à l'activation de l'abonnement
      });
      
      const savedProfile = await newProfile.save();
      
      // Ajouter ce profile à la liste des profiles de l'utilisateur
      await this.userModel.findByIdAndUpdate(userId, {
        $push: { profiles: savedProfile._id },
      });
      
      return savedProfile;
    } catch (error) {
      this.logger.error(`Failed to create profile with Stripe customer: ${error.message}`);
      throw new BadRequestException(`Failed to create profile: ${error.message}`);
    }
  }

 

  // Webhook pour gérer les événements Stripe
  async handleWebhookEvent(signature: string, payload: Buffer) {
    let event: Stripe.Event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
      }
      
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      
      this.logger.log(`Processing webhook event: ${event.type}`);
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }

    // Gérer les différents types d'événements
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSuccess(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook event ${event.type}: ${error.message}`);
      // We don't rethrow the error here to ensure Stripe doesn't retry the webhook unnecessarily
    }

    return { received: true };
  }

  // Gérer un paiement d'abonnement réussi
  private async handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
    if (!invoice.subscription) {
      this.logger.warn('Invoice has no subscription ID, skipping');
      return;
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
      
      if (!subscription.metadata || !subscription.metadata.profileId) {
        this.logger.warn(`Subscription ${invoice.subscription} has no profileId in metadata, skipping`);
        return;
      }
      
      const profileId = subscription.metadata.profileId;
      const profile = await this.ProfileModel.findById(profileId);
      
      if (!profile) {
        this.logger.warn(`Profile ${profileId} not found, skipping`);
        return;
      }

      // Incrémenter le nombre de paiements réussis
      const newTotalPayments = profile.totalPayments + 1;
      const isFullyPaid = newTotalPayments >= profile.expectedPayments;
      
      // Mettre à jour le profil
      await this.ProfileModel.findByIdAndUpdate(profileId, {
        totalPayments: newTotalPayments,
        subscriptionStatus: 'active',
        isFullyPaid: isFullyPaid,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      });

      this.logger.log(`Invoice payment succeeded for profile ${profileId}: ${newTotalPayments}/${profile.expectedPayments} payments`);
      
      // Si tous les paiements sont effectués, annuler l'abonnement pour éviter les frais supplémentaires
      if (isFullyPaid) {
        this.logger.log(`Subscription fully paid for profile ${profileId}, canceling at period end`);
        await this.stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      this.logger.error(`Error handling invoice payment success: ${error.message}`);
    }
  }
  async handleSubscriptionSuccess(sessionId: string) {
      try {
        this.logger.log(`Processing successful subscription for session: ${sessionId}`);
        
        const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription'],
        });
  
        if (!session || !session.metadata || !session.metadata.profileId) {
          throw new BadRequestException('Invalid session data');
        }
  
        const profileId = session.metadata.profileId;
        const subscription = session.subscription as Stripe.Subscription;
        const profile = await this.ProfileModel.findById(profileId);
  
        if (!profile) {
          throw new BadRequestException('Profile not found');
        }
  
        const currentPayments = profile.totalPayments || 0;
        const newTotalPayments = currentPayments + 1;
  
        // Mettre à jour le profil avec les informations d'abonnement
        await this.ProfileModel.findByIdAndUpdate(profileId, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionStartDate: new Date(subscription.current_period_start * 1000),
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          totalPayments: newTotalPayments, // Premier paiement effectué
          isBlocked: false, // Débloquer le profil car l'abonnement est actif
        });
  
        this.logger.log(`Subscription successfully activated for profile: ${profileId}`);
        return { success: true, profileId };
      } catch (error) {
        this.logger.error(`Failed to process subscription: ${error.message}`);
        throw new BadRequestException(`Failed to process subscription: ${error.message}`);
      }
    }
  // Gérer un échec de paiement

private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    this.logger.warn('Invoice has no subscription ID, skipping');
    return;
  }

  try {
    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
    
    if (!subscription.metadata || !subscription.metadata.profileId) {
      this.logger.warn(`Subscription ${invoice.subscription} has no profileId in metadata, skipping`);
      return;
    }
    
    const profileId = subscription.metadata.profileId;
    
    // Récupérer les informations détaillées sur l'échec de paiement
    let failureReason = 'Unknown';
    let failureMessage = 'Payment failed';
    
    // Si l'invoice a un payment_intent, récupérer les détails de l'échec
    if (invoice.payment_intent) {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          invoice.payment_intent as string
        );
        
        if (paymentIntent.last_payment_error) {
          failureReason = paymentIntent.last_payment_error.code || 'Unknown';
          failureMessage = paymentIntent.last_payment_error.message || 'Payment failed';
          
          this.logger.log(`Payment failure details: Code=${failureReason}, Message=${failureMessage}`);
        }
      } catch (piError) {
        this.logger.error(`Error retrieving payment intent: ${piError.message}`);
      }
    }
    
    // Mettre à jour le profil avec le statut et les informations d'échec
    await this.ProfileModel.findByIdAndUpdate(profileId, {
      subscriptionStatus: 'past_due',
      isBlocked: true, // Bloquer le profil en cas d'échec de paiement
      lastPaymentFailureReason: failureReason,
      lastPaymentFailureMessage: failureMessage,
      lastPaymentFailureDate: new Date()
    });
    
    this.logger.log(`Invoice payment failed for profile ${profileId}: ${failureReason} - ${failureMessage}`);
    
  } catch (error) {
    this.logger.error(`Error handling invoice payment failure: ${error.message}`);
  }
}

async getPaymentFailureDetails(profileId: string) {
  try {
    const profile = await this.ProfileModel.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    
    return {
      subscriptionStatus: profile.subscriptionStatus,
      hasFailureInfo: !!profile.lastPaymentFailureReason,
      lastPaymentFailureReason: profile.lastPaymentFailureReason,
      lastPaymentFailureMessage: profile.lastPaymentFailureMessage,
      lastPaymentFailureDate: profile.lastPaymentFailureDate,
      isBlocked: profile.isBlocked
    };
  } catch (error) {
    this.logger.error(`Error getting payment failure details: ${error.message}`);
    throw error;
  }
}

  // Gérer les mises à jour d'abonnement
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    if (!subscription.metadata || !subscription.metadata.profileId) {
      this.logger.warn(`Subscription ${subscription.id} has no profileId in metadata, skipping`);
      return;
    }
    
    try {
      const profileId = subscription.metadata.profileId;
      
      // Mettre à jour le statut de l'abonnement dans le profil
      await this.ProfileModel.findByIdAndUpdate(profileId, {
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        // Débloquer le profil si l'abonnement est à nouveau actif
        isBlocked: subscription.status !== 'active',
      });
      
      this.logger.log(`Subscription updated for profile ${profileId}: status=${subscription.status}`);
    } catch (error) {
      this.logger.error(`Error handling subscription update: ${error.message}`);
    }
  }

  // Gérer la suppression d'abonnement
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    if (!subscription.metadata || !subscription.metadata.profileId) {
      this.logger.warn(`Subscription ${subscription.id} has no profileId in metadata, skipping`);
      return;
    }
    
    try {
      const profileId = subscription.metadata.profileId;
      const profile = await this.ProfileModel.findById(profileId);
      
      if (!profile) {
        this.logger.warn(`Profile ${profileId} not found, skipping`);
        return;
      }

      // Si le profil a complété tous les paiements, le garder actif
      if (profile.isFullyPaid) {
        await this.ProfileModel.findByIdAndUpdate(profileId, {
          subscriptionStatus: 'canceled',
          isBlocked: false, // Ne pas bloquer si tous les paiements sont effectués
        });
        this.logger.log(`Subscription deleted for fully paid profile ${profileId}, keeping unblocked`);
      } else {
        // Sinon, mettre à jour le statut et bloquer le profil
        await this.ProfileModel.findByIdAndUpdate(profileId, {
          subscriptionStatus: 'canceled',
          isBlocked: true,
        });
        this.logger.log(`Subscription deleted for partially paid profile ${profileId}, blocking profile`);
      }
    } catch (error) {
      this.logger.error(`Error handling subscription deletion: ${error.message}`);
    }
  }

  // Vérifier le statut de l'abonnement
  async checkSubscriptionStatus(profileId: string) {
    try {
      const profile = await this.ProfileModel.findById(profileId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // Si le profil a déjà payé tous les mois attendus, il reste actif
      if (profile.isFullyPaid) {
        return {
          status: profile.subscriptionStatus,
          isActive: true,
          isFullyPaid: true,
          totalPayments: profile.totalPayments,
          expectedPayments: profile.expectedPayments,
        };
      }

      // Si le profil a un abonnement actif, vérifier son statut
      if (profile.stripeSubscriptionId) {
        try {
          const subscription = await this.stripe.subscriptions.retrieve(profile.stripeSubscriptionId);
          
          // Mettre à jour le statut si nécessaire
          if (subscription.status !== profile.subscriptionStatus) {
            await this.ProfileModel.findByIdAndUpdate(profileId, {
              subscriptionStatus: subscription.status,
              isBlocked: subscription.status !== 'active',
            });
          }
          
          return {
            status: subscription.status,
            isActive: subscription.status === 'active',
            isFullyPaid: profile.isFullyPaid,
            totalPayments: profile.totalPayments,
            expectedPayments: profile.expectedPayments,
          };
        } catch (error) {
          this.logger.warn(`Error retrieving subscription ${profile.stripeSubscriptionId}: ${error.message}`);
          // L'abonnement n'existe plus ou est inaccessible
          return {
            status: 'invalid',
            isActive: false,
            isFullyPaid: false,
            totalPayments: profile.totalPayments,
            expectedPayments: profile.expectedPayments,
          };
        }
      }

      return {
        status: profile.subscriptionStatus || 'none',
        isActive: profile.subscriptionStatus === 'active',
        isFullyPaid: profile.isFullyPaid || false,
        totalPayments: profile.totalPayments || 0,
        expectedPayments: profile.expectedPayments || 0,
      };
    } catch (error) {
      this.logger.error(`Error checking subscription status: ${error.message}`);
      throw error;
    }
  }

  // Obtenir un PaymentIntent
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve PaymentIntent: ${error.message}`);
      throw new Error(`Failed to retrieve PaymentIntent: ${error.message}`);
    }
  }

  // Annuler un abonnement manuellement
  async cancelSubscription(profileId: string): Promise<boolean> {
    try {
      const profile = await this.ProfileModel.findById(profileId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      
      if (!profile.stripeSubscriptionId) {
        throw new BadRequestException('No active subscription found for this profile');
      }

      // Verify subscription exists in Stripe
      try {
        const subscription = await this.stripe.subscriptions.retrieve(profile.stripeSubscriptionId);
        
        // Only try to cancel if not already canceled
        if (subscription.status !== 'canceled') {
          await this.stripe.subscriptions.cancel(profile.stripeSubscriptionId);
        }
        
        // Si le profil a payé tous les mois attendus, ne pas le bloquer
        if (profile.isFullyPaid) {
          await this.ProfileModel.findByIdAndUpdate(profileId, {
            subscriptionStatus: 'canceled',
            isBlocked: false,
          });
        } else {
          await this.ProfileModel.findByIdAndUpdate(profileId, {
            subscriptionStatus: 'canceled',
            isBlocked: true,
          });
        }
        
        this.logger.log(`Subscription ${profile.stripeSubscriptionId} canceled for profile ${profileId}`);
        return true;
      } catch (error) {
        // If subscription doesn't exist in Stripe, update local status
        if (error.message.includes('No such subscription')) {
          await this.ProfileModel.findByIdAndUpdate(profileId, {
            subscriptionStatus: 'canceled',
            isBlocked: !profile.isFullyPaid,
          });
          this.logger.log(`Subscription not found in Stripe, updated local status for profile ${profileId}`);
          return true;
        }
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw new BadRequestException(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async remove(id: string): Promise<Profile> {
    try {
      const deletedProfile = await this.ProfileModel.findByIdAndDelete(id).exec();
      if (!deletedProfile) {
        throw new NotFoundException('Profile not found');
      }
      
      // Extract the userId from the deleted profile.
      const userId = deletedProfile.userId;
      
      // Remove the profile's _id from the user's profiles array.
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { profiles: new Types.ObjectId(deletedProfile.id) },
      });
      
      // Si le profil a un abonnement Stripe actif, l'annuler
      if (deletedProfile.stripeSubscriptionId) {
        try {
          await this.cancelSubscription(id);
        } catch (error) {
          // Continuer même si l'annulation de l'abonnement échoue
          this.logger.error(`Failed to cancel subscription on profile deletion: ${error.message}`);
        }
      }
      
      this.logger.log(`Profile ${id} deleted successfully`);
      return deletedProfile;
    } catch (error) {
      this.logger.error(`Error removing profile: ${error.message}`);
      throw error;
    }
  }

  async deleteProfile(id: string) {
    return this.remove(id);
  }

  async checkProfileStatus(id: string): Promise<{ isActive: boolean; subscriptionStatus: string }> {
    try {
      const profile = await this.ProfileModel.findById(id).exec();
      if (!profile) {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }

      // Si le profil a terminé tous les paiements, il reste actif
      if (profile.isFullyPaid) {
        return { isActive: true, subscriptionStatus: profile.subscriptionStatus };
      }

      // Vérifier le statut de l'abonnement via Stripe
      const subscriptionStatus = await this.checkSubscriptionStatus(id);
      
      return { 
        isActive: !profile.isBlocked && subscriptionStatus.isActive, 
        subscriptionStatus: subscriptionStatus.status 
      };
    } catch (error) {
      this.logger.error(`Error checking profile status: ${error.message}`);
      throw error;
    }
  }

  // Initialiser un abonnement pour un 
  async initializeSubscription(
    profileId: string, 
    packId: string, 
    email: string, 
    pendingSignupId: string
  ): Promise<{ checkoutUrl: string }> {
    try {
      const result = await this.createCheckoutSession(
        packId,
        pendingSignupId,
        email,
        profileId
      );
      
      return { checkoutUrl: result.url };
    } catch (error) {
      this.logger.error(`Error initializing subscription: ${error.message}`);
      throw error;
    }
  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)

  async checkAllSubscriptions() {

    this.logger.log('Starting daily subscription status check');

    

    try {

      // Récupérer tous les profils avec un abonnement actif qui ne sont pas entièrement payés

      const profiles = await this.ProfileModel.find({

        stripeSubscriptionId: { $exists: true, $ne: null },

        isFullyPaid: { $ne: true },

        // Optionnellement, vous pouvez filtrer par subscriptionStatus si nécessaire

      });

      

      this.logger.log(`Found ${profiles.length} profiles to check`);

      

      for (const profile of profiles) {

        try {

          // Vérifier le statut de l'abonnement dans Stripe

          const status = await this.checkSubscriptionStatus(profile.id);

          

          // Si le statut a changé ou n'est plus actif, mettre à jour le profil

          if (!status.isActive || status.status !== profile.subscriptionStatus) {

            await this.ProfileModel.findByIdAndUpdate(profile._id, {

              subscriptionStatus: status.status,

              isBlocked: !status.isActive && !profile.isFullyPaid,

            });

            

            this.logger.log(`Updated profile ${profile._id}: status=${status.status}, blocked=${!status.isActive && !profile.isFullyPaid}`);

          }

        } catch (error) {

          this.logger.error(`Error checking subscription for profile ${profile._id}: ${error.message}`);

          // Continuer avec le prochain profil

        }

      }

      

      this.logger.log('Daily subscription check completed');

    } catch (error) {

      this.logger.error(`Failed to run daily subscription check: ${error.message}`);

    }

  }

  //update carte 
  async createCardUpdateSession(profileId: string): Promise<{ url: string }> {
    try {
      this.logger.log(`Creating card update session for profile: ${profileId}`);
      
      // Récupérer le profil pour obtenir le customer ID
      const profile = await this.ProfileModel.findById(profileId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      
      if (!profile.stripeCustomerId) {
        throw new BadRequestException('No Stripe customer ID found for this profile');
      }
      
      if (!profile.stripeSubscriptionId) {
        throw new BadRequestException('No active subscription found for this profile');
      }
      
      // Créer une session de setup pour mettre à jour la méthode de paiement
      const session = await this.stripe.billingPortal.sessions.create({
        customer: profile.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/payment-settings?profileId=${profileId}`,
      });
      
      this.logger.log(`Card update session created for profile: ${profileId}`);
      return { url: session.url };
    } catch (error) {
      this.logger.error(`Failed to create card update session: ${error.message}`);
      throw new BadRequestException(`Failed to create card update session: ${error.message}`);
    }
  }
 

}