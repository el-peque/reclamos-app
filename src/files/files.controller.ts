import { Controller, Get, Post, Param, UploadedFile, UseInterceptors, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';


@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}

  @Get('complaint/:imageName')
  findOne(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticComplaintImage(imageName);
    res.sendFile(path);
  }

  @Post('complaint')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // storage: ({
      // destination: './static/uploads',
      // filename: fileNamer
    // })
  }))
  async uploadComplaintImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({fileType: /(jpg|jpeg|png)$/}),
          new MaxFileSizeValidator({maxSize: 4000000}),
        ],
        fileIsRequired: true,
      }))  file: Express.Multer.File
  ) {
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${ uuid() }.${ fileExtension }`;
    const result = await this.filesService.uploadPublicFile(
      file.buffer,
      fileName,
    )
    const secureUrl = `${this.configService.get('HOST_API')}/files/complaint/${file.filename}`
    return result;
    return {secureUrl};
  }
}