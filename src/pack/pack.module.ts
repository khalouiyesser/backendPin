import { Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, PackSchema } from './entities/pack.entity';
import { MailService } from 'src/services/mail.service';

@Module({
  imports: [   
      MongooseModule.forFeature([{ name: Pack.name, schema: PackSchema } ,      
        
      ]), 
    
  ],
  controllers: [PackController],
  providers: [PackService ,MailService],
  exports: [PackService],
})
export class PackModule {}
