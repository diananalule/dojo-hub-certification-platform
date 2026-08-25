import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cookieParser());

  // Behind the web app's /api proxy (and Render's edge), so honour X-Forwarded-For
  // when resolving the client address — otherwise rate limiting sees one shared IP.
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  app.enableCors({
    origin: configService.get<string>('webUrl'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dojo Hub Certification Platform API')
    .setDescription('REST API for the Dojo Hub certification platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port') ?? 4000;
  await app.listen(port);

  console.log(`Dojo Hub API listening on http://localhost:${port}/api`);
}

void bootstrap();
