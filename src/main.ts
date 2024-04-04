import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import hbs from 'handlebars';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: hbs,
    },
    includeViewExtension: true,
    options: {
      partials: {
        // components: join(__dirname, '..', 'views', 'components'),
      },
    },
    root: join(__dirname, '..', 'views'),
    templates: join(__dirname, '..', 'views'),
    layout: join('layouts', 'main.hbs'),
  });

  await app.listen(9000, '0.0.0.0');
}
bootstrap();
