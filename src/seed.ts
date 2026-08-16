import { NestFactory } from '@nestjs/core';
import { SeederModule } from './modules/seeder/seeder.module';
import { SeederService } from './modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seederService = app.get(SeederService);
  
  try {
    await seederService.seed();
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
