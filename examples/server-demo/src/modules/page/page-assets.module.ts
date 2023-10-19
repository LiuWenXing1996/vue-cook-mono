import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { cwd } from 'node:process';

const serveRoot = `/page/asserts`;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(cwd(), '../'),
      serveRoot,
    }),
  ],
})
export class PageAssetsModule {
  getPluginAutoEntry(projectName: string) {
    const entry = {
      js: join(serveRoot, projectName, './dist/design/remote-plugin/index.js'),
      css: join(
        serveRoot,
        projectName,
        './dist/design/remote-plugin/style.css',
      ),
    };
    return entry;
  }
}
