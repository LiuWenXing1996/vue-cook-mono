import { AppService } from './app.service';
import { createReadStream } from 'fs';
import * as fs from "fs"
import { join } from 'path';
import * as path from "path"
import { Controller, Get, StreamableFile, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import * as JSZip from "jszip"
import { Readable } from 'node:stream'

@Controller()
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
  @Get("zipss")
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="t.zip"')
  getZipFile(): StreamableFile {
    const zip = new JSZip();

    function readDir(obj, nowPath) {
      let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
      files.forEach(function (fileName, index) {//遍历检测目录中的文件
        console.log(fileName, index);//打印当前读取的文件名
        let fillPath = nowPath + "/" + fileName;
        let file = fs.statSync(fillPath);//获取一个文件的属性
        if (file.isDirectory()) {//如果是目录的话，继续查询
          let dirlist = zip.folder(fileName);//压缩对象中生成该目录
          readDir(dirlist, fillPath);//重新检索目录文件
        } else {
          //  TODO：这个路径插入有问题
          obj.file(fileName, fs.readFileSync(fillPath));//压缩目录添加文件
        }
      });
    }
    console.log("JSZip", JSZip)
    //开始压缩文件
    function startZIP() {
      var currPath = __dirname;//文件的绝对路径 当前当前js所在的绝对路径
      var targetDir = path.join(currPath, "../../vite-single-page-app/lowcode");
      readDir(zip, targetDir);
      // zip.generateAsync({//设置压缩格式，开始打包
      //   type: "nodebuffer",//nodejs用
      //   compression: "DEFLATE",//压缩算法
      //   compressionOptions: {//压缩级别
      //     level: 9
      //   }
      // }).then(function (content) {
      //   fs.writeFileSync(currPath + "/result.zip", content, "utf-8");//将打包的内容写入 当前目录下的 result.zip中
      // });
    }

    startZIP();
    const oreader = zip.generateNodeStream();
    const myReader = new Readable().wrap(oreader);
    // const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(myReader);
  }
}
