import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api/api.module';
import { PageModule } from './modules/page/page.module';

@Module({
  imports: [ApiModule, PageModule],
})
export class AppModule {}
