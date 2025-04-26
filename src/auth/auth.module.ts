// import { Module ,forwardRef  } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { MongooseModule } from '@nestjs/mongoose';
// import { User, UserSchema } from './schemas/user.schema';
// import {
//   RefreshToken,
//   RefreshTokenSchema,
// } from './schemas/refresh-token.schema';
// import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema';
// import { MailService } from 'src/services/mail.service';
// import { RolesModule } from 'src/roles/roles.module';
// import { AccountModule } from 'src/account/account.module';
// import { PendingSignup, PendingSignupSchema } from './schemas/pending-signup';
// import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';
// import { StripePaymentModule } from 'src/stripe-payment/stripe-payment.module';
// import { Pack, PackSchema } from 'src/pack/entities/pack.entity';
// import {ProfileService} from "../profile/profile.service";
//
// @Module({
//   imports: [
//     RolesModule,
//     AccountModule,
//       ProfileService,
//    StripePaymentModule,
//     MongooseModule.forFeature([
//       { name: User.name, schema: UserSchema },
//       { name: RefreshToken.name, schema: RefreshTokenSchema },
//       { name: ResetToken.name, schema: ResetTokenSchema },
//       { name: PendingSignup.name, schema: PendingSignupSchema },
//       { name: Pack.name, schema: PackSchema }
//     ]),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, MailService, StripePaymentService,ProfileService],
//   exports: [AuthService,MongooseModule],
// })
// export class AuthModule {}
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesModule } from 'src/roles/roles.module';
import { AccountModule } from 'src/account/account.module';
import { PendingSignup, PendingSignupSchema } from './schemas/pending-signup';
import { StripePaymentService } from 'src/stripe-payment/stripe-payment.service';
import { StripePaymentModule } from 'src/stripe-payment/stripe-payment.module';
import { Pack, PackSchema } from 'src/pack/entities/pack.entity';
import { ProfileModule } from '../profile/profile.module'; // ✅ Importer ProfileModule au lieu de ProfileService
import { PackModule } from 'src/pack/pack.module';
import { PackService } from 'src/pack/pack.service';

@Module({
  imports: [
    RolesModule,
    AccountModule,
    PackModule,
    forwardRef(() => ProfileModule), // ✅ Évite la dépendance circulaire
    StripePaymentModule,
    MongooseModule.forFeature([

      { name: User.name, schema: UserSchema },
      { name: Pack.name, schema: PackSchema },

      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: ResetToken.name, schema: ResetTokenSchema },
      { name: PendingSignup.name, schema: PendingSignupSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, StripePaymentService,PackService],
  exports: [AuthService, MongooseModule],
})
export class AuthModule {}
