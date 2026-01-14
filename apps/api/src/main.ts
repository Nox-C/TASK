import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { inject } from '@vercel/analytics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Enable Vercel Web Analytics
  if (process.env.NODE_ENV === 'production') {
    inject();
  }
  
  await app.listen(3001);
}
bootstrap();
