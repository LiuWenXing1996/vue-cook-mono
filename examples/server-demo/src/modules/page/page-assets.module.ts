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
  getPluginAutoEntry(projectName: string, baseUrl?: string) {
    const tryGenUrl = (path: string) => {
      if (baseUrl) {
        return new URL(path, baseUrl).toString();
      }
      return path;
    };
    const entry = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/design/remote-plugin/index.js'),
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/design/remote-plugin/style.css'),
      ),
    };
    return entry;
  }
  getDesignDepsEntry(projectName: string, baseUrl?: string) {
    const tryGenUrl = (path: string) => {
      if (baseUrl) {
        return new URL(path, baseUrl).toString();
      }
      return path;
    };
    const entry = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/deps/design/index.js'),
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/deps/design/style.css'),
      ),
    };
    return entry;
  }
  getRuntimeDepsEntry(projectName: string, baseUrl?: string) {
    const tryGenUrl = (path: string) => {
      if (baseUrl) {
        return new URL(path, baseUrl).toString();
      }
      return path;
    };
    const entry = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/runtime/deps/index.js'),
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/runtime/deps/style.css'),
      ),
    };
    return entry;
  }
}
