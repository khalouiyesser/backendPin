import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { ProfileModule } from 'src/profile/profile.module';
import { StripePaymentModule } from 'src/stripe-payment/stripe-payment.module';

@Module({
  imports: [ProfileModule,StripePaymentModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService], 
})
export class AccountModule {}
