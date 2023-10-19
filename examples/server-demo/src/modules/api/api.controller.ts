import {
  Controller,
  Get,
  StreamableFile,
  Res,
  Header,
  Query,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import JSZip from 'jszip';
import { Readable } from 'node:stream';
import { GetZipFileParams } from './api.dto';
import { cwd } from 'process';

@Controller('api')
export class ApiController {
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
}
