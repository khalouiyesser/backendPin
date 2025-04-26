import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { AccountModule } from './account/account.module';
import { ProfileModule } from './profile/profile.module';
import { StripePaymentModule } from './stripe-payment/stripe-payment.module';
import { PackModule } from './pack/pack.module';

import config from './config/config';
import { ScheduleModule } from '@nestjs/schedule';

import { SurplusModule } from './surplus/surplus.module';


@Module({
  imports: [  

    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    RolesModule,
    AccountModule,
    ProfileModule,
    StripePaymentModule,
    PackModule,
    SurplusModule,
   ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {


  
}
