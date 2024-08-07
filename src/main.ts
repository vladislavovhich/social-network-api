import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from "body-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Social Network API')
    .setDescription('Social Network API')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  SwaggerModule.setup('api-docs', app, document);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  await app.listen(3000);
}
bootstrap();
