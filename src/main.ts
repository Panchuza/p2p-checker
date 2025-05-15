import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Cargar variables de entorno primero
  dotenv.config();
  
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS antes de iniciar el servidor
  app.enableCors({
    origin: ['http://localhost:3000', 'electron://*'],
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
  });

  const port = process.env.PORT || 3000;
  
  try {
    await app.listen(port);
    console.log(`✅ Servidor NestJS ejecutándose en: http://localhost:${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️  Error: El puerto ${port} está en uso. Probando con puerto ${+port + 1}...`);
      await app.listen(+port + 1);
      console.log(`✅ Servidor reiniciado en puerto alternativo: http://localhost:${+port + 1}`);
    } else {
      console.error('❌ Error crítico al iniciar el servidor:', error.message);
      process.exit(1);
    }
  }
}

bootstrap();