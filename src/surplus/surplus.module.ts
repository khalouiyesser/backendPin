import { Module } from '@nestjs/common';
import { SurplusService } from './surplus.service';
import { SurplusController } from './surplus.controller';
import { Surplus, SurplusSchema } from './entities/surplus.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  
  imports: [
  MongooseModule.forFeature([{ name: Surplus.name, schema: SurplusSchema }]),
  AuthModule, // Import UserModule to use UserModel
],

  controllers: [SurplusController],
  providers: [SurplusService]
})
export class SurplusModule {}
