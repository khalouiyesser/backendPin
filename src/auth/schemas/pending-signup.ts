import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

export type PendingSignupDocument = PendingSignup & Document;

@Schema({ timestamps: true })
export class PendingSignup {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false})
  password: string; // Store hashed password

  @Prop({ required: false })
  idGoogle?: string;
    
  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: false })
  phoneNumber?: string;

  @Prop({ required: false })
  photoUrl?: string;

  @Prop({ type: Types.ObjectId, required: true })
  packId: Types.ObjectId;

  @Prop({ required: false })
  verificationToken?: string; // For email confirmation link

  @Prop({ default: false })
  isVerified: boolean; // Status of signup verification

  // Add the profile reference
  @Prop({ type: Types.ObjectId, ref: 'Profile' })
  defaultProfileId: Types.ObjectId;
}

export const PendingSignupSchema = SchemaFactory.createForClass(PendingSignup);