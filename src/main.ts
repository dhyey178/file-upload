import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FileResponseDto } from './files/dto/file-response.dto';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },

  }));
  const config = new DocumentBuilder()
    .setTitle('File Upload API')
    .setDescription('API documentation for the file upload service with background processing.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const extraModels = [FileResponseDto];
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: extraModels,
  });

  SwaggerModule.setup('api', app, document);

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
