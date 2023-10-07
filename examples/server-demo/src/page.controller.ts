import { AppService } from './app.service';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import * as path from 'path';
import {
  Controller,
  Get,
  StreamableFile,
  Res,
  Header,
  Render,
} from '@nestjs/common';
import { Response } from 'express';

@Controller('page-servers')
export class PageController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return '<div class="sss">sss</div>';
  }

  @Get('/**')
  @Render('index')
  root(@Res() res: Response) {
    return {
      message: 'Hello world!',
      auto: {
        jsUrl: '/page-server/asserts/auto/index.js',
        cssUrl: '/page-server/asserts/auto/index.css',
      },
    };
  }
}
