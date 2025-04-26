import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Surplus } from 'src/surplus/entities/surplus.entity';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: false })
  idGoogle: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Profile' }] })
  profiles: Types.ObjectId[];

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Surplus' }] }) // One-to-Many Relation
  surpluses: Surplus[];

  @Prop({ required: false })
  wallet: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
