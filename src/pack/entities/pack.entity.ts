import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class Pack extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: SchemaTypes.Number })
  price: number;
  @Prop({ required: true, type: SchemaTypes.Number })
  panels: number;
  @Prop({ required: true, type: SchemaTypes.Number })
  generated: number;
  @Prop({ required: true, type: SchemaTypes.Number })
  gain: number;
  @Prop({ required: true, type: SchemaTypes.Number })
  fossil: number;
  @Prop({ required: true, type: SchemaTypes.Number })
  durationMonths: number;
  @Prop({ required: true })
  stripePriceId: string;

}

export const PackSchema = SchemaFactory.createForClass(Pack);
