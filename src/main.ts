/*import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Description de votre API')
    .setVersion('1.0')
    .addBearerAuth() // Ajoute l'authentification par token si nécessaire
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);



}
bootstrap();*/


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Création de l'application HTTP (REST API)
  const app = await NestFactory.create(AppModule);

  // Configuration des pipes de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl?.includes('/stripe-payment/webhook')) {
          req.rawBody = buf;
        }
        return true;
      },
    })
  );
  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Description de votre API')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);



  // Démarrer le serveur HTTP
  await app.listen(3009);
}

bootstrap();
