import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './shared/api/filters/custom-exception.filter';
import { ResponseInterceptor } from './shared/api/interceptors/response.interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with custom options
  app.enableCors({
    origin: ['http://localhost:3000'], // Allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    credentials: true, // Allow credentials (e.g., cookies)
    allowedHeaders: 'Content-Type, Accept', // Allowed headers
  });

  const config = new DocumentBuilder()
    .setTitle('Search Result Analyzer')
    .setDescription('Provides AI Augmented Search Engine Analyitics')
    .setVersion('1.0')
    .addTag('goodie')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new CustomExceptionFilter(httpAdapter)
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <== Enables automatic type conversion
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
