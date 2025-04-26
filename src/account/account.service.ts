import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile } from 'src/profile/entities/profile.entity';
import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';


@Injectable()
export class AccountService {
  constructor(

    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    private readonly stripePaymentService: StripePaymentService,

  ) {}
  async createDefaultProfile(userId: string, packId: string): Promise<Profile> {
    // Validate the packId
    if (!Types.ObjectId.isValid(packId)) {
      throw new BadRequestException('Invalid pack ID');
    }

    // Create the default profile. You might customize the profile name further.
    const profile = new this.profileModel({
      name: "Default Profile", // Consider using the user's name if accessible.
      userId: new Types.ObjectId(userId),
      packId: new Types.ObjectId(packId),
      image: null, // Default image can be set if needed.
    });

    const savedProfile = await profile.save();

    // Optionally: Update the user document's profiles array if you want to keep a list there.
    // This step is optional if you rely on Mongoose population via the Profile's userId reference.

    return savedProfile;
  }
  /*
  async createProfileForPendingSignup(packId: string): Promise<Profile> {
    const createdProfile = new this.profileModel({
      name: 'Default Profile',
      packId: new Types.ObjectId(packId),
      // Note: No userId yet since the user doesn't exist
      subscriptionStatus: 'incomplete',
      isBlocked: true, // Blocked by default until subscription is active
    });
    
    return await createdProfile.save();
  }
*/
async createProfileForPendingSignup(packId: string, email: string, name: string): Promise<Profile> {
  // Créer un Customer ID Stripe pour ce profil
  const stripeCustomerId = await this.stripePaymentService.createStripeCustomer(
    email, 
    name || 'Default Profile'
  );
  
  const createdProfile = new this.profileModel({
    name: name || 'Default Profile',
    packId: new Types.ObjectId(packId),
    // Note: No userId yet since the user doesn't exist
    subscriptionStatus: 'incomplete',
    isBlocked: true, // Blocked by default until subscription is active
    stripeCustomerId: stripeCustomerId, // Sauvegarder le Customer ID Stripe
  });
      
  return await createdProfile.save();
}
  async associateProfileWithUser(profileId: string, userId: string): Promise<Profile> {
    const profile = await this.profileModel.findByIdAndUpdate(
      profileId,
      { userId: new Types.ObjectId(userId) },
      { new: true }
    ).exec();
    
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${profileId} not found`);
    }
    
    return profile;
  }
}
