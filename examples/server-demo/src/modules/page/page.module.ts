import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';

import { PageAssetsModule } from './page-assets.module';

@Module({
  imports: [PageAssetsModule],
  controllers: [PageController],
  providers: [PageService, PageAssetsModule],
})
export class PageModule {}
