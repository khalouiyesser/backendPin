import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Model, Types } from 'mongoose';
import { Profile } from './entities/profile.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const createdProfile = new this.profileModel({
      ...createProfileDto,
      userId: new Types.ObjectId(createProfileDto.userId),
      subscriptionStatus: 'incomplete',
      isBlocked: true, // Bloquer par défaut jusqu'à ce que l'abonnement soit actif
    });
    const savedProfile = await createdProfile.save();

    // Update the user's profiles array by pushing the new profile's _id
    await this.userModel.findByIdAndUpdate(createProfileDto.userId, {
      $push: { profiles: savedProfile._id },
    });
    return savedProfile;
  }





 


  async findAll(): Promise<Profile[]> {
    return this.profileModel.find().exec();
  }

  async findOne(id: string): Promise<Profile> {
    return this.profileModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<Profile[]> {
    return this.profileModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async update(id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.profileModel.findByIdAndUpdate(id, updateProfileDto, { new: true }).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

 

  async blockProfile(id: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    // Mettre à jour le profil pour le bloquer
    profile.isBlocked = true;
    return profile.save();
  }

  async unblockProfile(id: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    // Mettre à jour le profil pour le débloquer
    profile.isBlocked = false;
    return profile.save();
  }

  // Vérifier si un profil est actif et son abonnement est valide
 
}