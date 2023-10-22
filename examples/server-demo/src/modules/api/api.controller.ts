import {
  Controller,
  Get,
  StreamableFile,
  Header,
  Query,
  Inject,
  Request,
} from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import JSZip from 'jszip';
import { Readable } from 'node:stream';
import { GetZipFileParams } from './api.dto';
import { cwd } from 'process';
import { PageAssetsModule } from '../page/page-assets.module';

@Controller('api')
export class ApiController {
  @Inject(PageAssetsModule)
  private pageAssetsModule: PageAssetsModule;

  @Get('getZip')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="t.zip"')
  async getZipFile(@Query() params: GetZipFileParams): Promise<StreamableFile> {
    const { projectName } = params;
    const zip = new JSZip();
    const targetDir = join(cwd(), `../${projectName}`);
    console.log(targetDir);
    console.log(cwd());
    const { globby } = await import('globby');
    const ls = await globby(['**/*'], {
      cwd: targetDir,
      gitignore: true,
    });
    for (const f of ls) {
      let filePath = join(targetDir, f);
      const content = await readFile(filePath);
      zip.file(f, content);
    }
    const oreader = zip.generateNodeStream();
    const myReader = new Readable().wrap(oreader);
    return new StreamableFile(myReader);
  }
  @Get('getRemotePluginEntry')
  async getRemotePluginEntry(
    @Query() params: { projectName: string },
    @Request() req: ExpressRequest,
  ) {
    const protocol = req.protocol;
    const host = req.get('Host');
    const { projectName } = params;
    const baseUrl = protocol + '://' + host;
    return {
      data: this.pageAssetsModule.getPluginAutoEntry(projectName, baseUrl),
      isSuccess: true,
    };
  }
  @Get('getDesignDepsEntry')
  async getDesignDepsEntry(
    @Query() params: { projectName: string },
    @Request() req: ExpressRequest,
  ) {
    const protocol = req.protocol;
    const host = req.get('Host');
    const { projectName } = params;
    const baseUrl = protocol + '://' + host;
    return {
      data: this.pageAssetsModule.getDesignDepsEntry(projectName, baseUrl),
      isSuccess: true,
    };
  }
  @Get('getRuntimeDepsEntry')
  async getRuntimeDepsEntry(
    @Query() params: { projectName: string },
    @Request() req: ExpressRequest,
  ) {
    const protocol = req.protocol;
    const host = req.get('Host');
    const { projectName } = params;
    const baseUrl = protocol + '://' + host;
    return {
      data: this.pageAssetsModule.getRuntimeDepsEntry(projectName, baseUrl),
      isSuccess: true,
    };
  }
}
