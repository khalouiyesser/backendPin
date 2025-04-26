import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema'

@Schema()
export class Surplus extends Document {
  @Prop({ required: true })
  amount: string;

  @Prop({ default: false })
  state: boolean;

  @Prop({ required: true })
  relay: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Many-to-One Relation
  user: User;
}

export const SurplusSchema = SchemaFactory.createForClass(Surplus);
