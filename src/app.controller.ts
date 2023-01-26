import { Controller, Get, Param, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/assets/:img')
  getAssetsPhoto(@Param() param, @Res() res) {
    const fileName = param.img;
    const filePath = join(process.cwd(), 'src/assets/avatars/', fileName);
    const readStream = createReadStream(filePath);
    readStream.pipe(res);
  }

  @Get('default-avatar')
  getDefaultAvatart(@Res() res) {
    const fileName = 'DefaultAvatar.webp';
    const filePath = join(process.cwd(), 'src/assets/default/', fileName);
    const readStream = createReadStream(filePath);
    readStream.pipe(res);
    // for download
    // return new StreamableFile(readStream);
  }
}
