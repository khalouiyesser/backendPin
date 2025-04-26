import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './entities/profile.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import {AuthService} from "../auth/auth.service";
import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';
import { StripePaymentModule } from 'src/stripe-payment/stripe-payment.module';

@Module({
  imports: [   
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema } ,      
      { name: User.name, schema: UserSchema },
    ])
  
],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [MongooseModule,ProfileService],
})
export class ProfileModule {}
