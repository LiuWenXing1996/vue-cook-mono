import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { cwd } from 'node:process';

const serveRoot = `/page/asserts`;

const tryGenUrl = (path: string, baseUrl?: string) => {
  if (baseUrl) {
    return new URL(path, baseUrl).toString();
  }
  return path;
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(cwd(), '../'),
      serveRoot,
    }),
  ],
})
export class PageAssetsModule {
  getDevEntry(projectName: string, baseUrl?: string) {
    const auto = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/auto/index.js'),
        baseUrl,
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/auto/style.css'),
        baseUrl,
      ),
    };
    const deps = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/deps/runtime/none-external/index.js'),
        baseUrl,
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/deps/runtime/none-external/style.css'),
        baseUrl,
      ),
    };
    const schema = {
      js: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/schema/index.js'),
        baseUrl,
      ),
      css: tryGenUrl(
        join(serveRoot, projectName, './dist/dev/schema/index.css'),
        baseUrl,
      ),
    };
    return { auto, deps, schema };
  }
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
  getDesignAutoEntry(projectName: string, baseUrl?: string) {
    const tryGenUrl = (path: string) => {
      if (baseUrl) {
        return new URL(path, baseUrl).toString();
      }
      return path;
    };
    const entry = {
      js: tryGenUrl(join(serveRoot, projectName, './dist/dev/auto/index.js')),
      css: tryGenUrl(join(serveRoot, projectName, './dist/dev/auto/style.css')),
    };
    return entry;
  }
}
