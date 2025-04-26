import { Module ,forwardRef  } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { StripePaymentController } from './stripe-payment.controller';
import { PackModule } from 'src/pack/pack.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from 'src/pack/entities/pack.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { ProfileModule } from 'src/profile/profile.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [ MongooseModule.forFeature([{ name: Pack.name, schema: PackSchema }]), // Register PackModel
  PackModule,ProfileModule
 ],
  
  controllers: [StripePaymentController],
  providers: [StripePaymentService],
  exports: [StripePaymentService], 

})
export class StripePaymentModule {}
