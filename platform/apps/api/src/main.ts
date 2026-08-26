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

  // Two proxies sit in front of a browser request: Render's edge, and the web app's
  // /api rewrite. Express must be told how many, not just that some exist — `true`
  // trusts the entire X-Forwarded-For chain, which means req.ip becomes the left-most
  // entry, and that one is written by the client. A forged header then buys a fresh
  // rate-limit budget, and a transparent ISP proxy that injects its own address puts
  // every user behind it into a single shared budget. Counting the hops instead makes
  // Express resolve the address from the trusted end of the chain.
  app.getHttpAdapter().getInstance().set('trust proxy', 2);

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
