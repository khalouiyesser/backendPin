import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose';
import { Pack } from "src/pack/entities/pack.entity";

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  image: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: Pack.name })
  packId: Types.ObjectId;

  @Prop({ default: false })
  isBlocked: boolean;
  
  // Informations d'abonnement Stripe
  @Prop()
  stripeCustomerId: string;
  
  @Prop()
  stripeSubscriptionId: string;
  
  @Prop({ enum: ['active', 'past_due', 'canceled', 'unpaid', 'trial', 'incomplete'], default: 'incomplete' })
  subscriptionStatus: string;
  
  @Prop()
  subscriptionStartDate: Date;
  
  @Prop()
  subscriptionEndDate: Date;
  
  @Prop({ default: 0 })
  totalPayments: number;
  
  @Prop({ default: 0 })
  expectedPayments: number;
  
  @Prop({ default: false })
  isFullyPaid: boolean;
  @Prop({ type: String, default: null })
  lastPaymentFailureReason: string;

  @Prop({ type: String, default: null })
  lastPaymentFailureMessage: string;

  @Prop({ type: Date, default: null })
  lastPaymentFailureDate: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);