import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    const configService = app.get(ConfigService);

    // Security
    app.use(helmet());

    // CORS
    app.enableCors({
      origin: [
        'https://arlink.online',
        'https://www.arlink.online',
        'https://dev.arlink.online',
        'https://admin.arlink.online',
        'https://api.arlink.online',
        /^https:\/\/[a-z0-9-]+\.arlink\.online$/,
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });

    // Compression
    app.use(compression());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global API prefixing (all routes start with /api)
    app.setGlobalPrefix('api', {
      exclude: [
        'media/*',    // Exclude media files
        'uploads/*',  // Exclude legacy uploads
      ],
    });
    
    const port = configService.get('PORT', 3001);

    await app.listen(port);

    console.log(`ARLink API running on http://localhost:${port}`);
    console.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
    console.log(`Database: ${configService.get('DB_DATABASE', 'arlink_v3')}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  };
}

bootstrap();
