import { AppService } from './app.service';
import { createReadStream } from 'fs';
import * as fs from "fs"
import { join } from 'path';
import * as path from "path"
import { Controller, Get, StreamableFile, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import * as JSZip from "jszip"
import { Readable } from 'node:stream'
import * as shelljs from "shelljs"

@Controller("api")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get("file")
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
  @Get("files")
  getFileS(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="package.zip"',
    });
    return new StreamableFile(file);
  }
  @Get("build")
  build(): string {
    var currPath = __dirname;//文件的绝对路径 当前当前js所在的绝对路径
    var targetDir = path.join(currPath, "../../vite-single-page-app");
    shelljs.cd(`${targetDir}`)
    shelljs.exec(`pnpm build`)
    return "ss";
  }
  @Get("getZip")
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="t.zip"')
  getZipFile(): StreamableFile {
    const zip = new JSZip();
    var currPath = __dirname;//文件的绝对路径 当前当前js所在的绝对路径
    var targetDir = path.join(currPath, "../../vite-single-page-app/lowcode");
    function readDir(obj, nowPath) {
      let files = fs.readdirSync(nowPath).map(e => path.resolve(nowPath, e));//读取目录中的所有文件及文件夹（同步操作）
      files.forEach(function (fillPath, index) {//遍历检测目录中的文件
        const f = path.relative(targetDir, fillPath)
        let file = fs.statSync(fillPath);//获取一个文件的属性
        if (file.isDirectory()) {//如果是目录的话，继续查询
          let dirlist = zip.folder(f);//压缩对象中生成该目录
          readDir(dirlist, fillPath);//重新检索目录文件
        } else {
          zip.file(f, fs.readFileSync(fillPath));//压缩目录添加文件
        }
      });
    }
    console.log("JSZip", JSZip)
    //开始压缩文件
    function startZIP() {
      readDir(zip, targetDir);
    }

    startZIP();
    const oreader = zip.generateNodeStream();
    const myReader = new Readable().wrap(oreader);
    // const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(myReader);
  }
}
