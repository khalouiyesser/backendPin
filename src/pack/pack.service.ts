import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pack } from './entities/pack.entity';

@Injectable()
export class PackService {
  constructor(@InjectModel(Pack.name) private packModel: Model<Pack>) {}

  async createPack(
    title: string, 
    description: string, 
    price: number, 
    panels: number, 
    generated: number, 
    gain: number, 
    fossil: number,
    stripePriceId: string,
    durationMonths: number
  ): Promise<Pack> {
    return this.packModel.create({ 
      title, 
      description, 
      price, 
      panels, 
      generated, 
      gain, 
      fossil, 
      stripePriceId,
      durationMonths 
    });
  }

  async getAllPacks(): Promise<Pack[]> {
    return this.packModel.find().lean();
  }

  async getPack(id: string): Promise<Pack> {
    const pack = await this.packModel.findById(id).lean();
    if (!pack) {
      throw new NotFoundException('Pack not found');
    }
    return pack;
  }

  async updatePack(id: string, title: string, description: string, price: number, panels: number, generated: number, gain: number, fossil: number): Promise<Pack> {
    const updatedPack = await this.packModel.findByIdAndUpdate(id, { title, description, price, panels, generated, gain, fossil }, { new: true, runValidators: true }).lean();
    if (!updatedPack) {
      throw new NotFoundException('Pack not found');
    }
    return updatedPack;
  }

  async deletePack(id: string): Promise<{ message: string }> {
    const deletedPack = await this.packModel.findByIdAndDelete(id).lean();
    if (!deletedPack) {
      throw new NotFoundException('Pack not found');
    }
    return { message: 'Pack successfully deleted' };
  }
}
