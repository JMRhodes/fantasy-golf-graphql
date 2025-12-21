import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);

  return app;
}

bootstrap()
  .then(async (app) => {
    console.log(`Application is running on: ${await app.getUrl()}`);
  })
  .catch((err) => {
    console.error('Error starting application:', err);
  });
