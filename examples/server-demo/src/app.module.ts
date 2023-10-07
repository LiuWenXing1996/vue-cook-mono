import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PageController } from './page.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../vite-single-page-app/dist'),
      serveRoot: '/page-server/asserts',
    }),
  ],
  controllers: [AppController, PageController],
  providers: [AppService],
})
export class AppModule {}
