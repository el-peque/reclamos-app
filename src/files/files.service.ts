import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as csv from 'csvtojson';
import { CSVFormat } from './dto/csv-format.dto';
import { Validate, Validator } from 'class-validator';
import { Readable } from 'stream';
import * as papa from 'papaparse';

@Injectable()
export class FilesService {
    constructor(
        private readonly configService: ConfigService,
        ) {}

    getStaticComplaintImage(imageName: string) {
        const path = join(__dirname, '../../static/uploads', imageName);

        if (!existsSync(path)) {
            throw new BadRequestException(`Complaint with image ${imageName} not found`);
        }
        return path;
    }
    
    async uploadPublicFile(dataBuffer: Buffer, filename: string): Promise<string> {
        try {
          const s3 = new S3();
          const uploadResult = await s3
            .upload({
              Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
              Body: dataBuffer,
              Key: filename
            })
            .promise();
          return uploadResult.Location;
        } catch (err) {
          throw new BadRequestException(err.message);
        }
    }

    async parseCsvFile(dataBuffer: Buffer): Promise<CSVFormat> {
      const parsedFile = await csv().fromString(dataBuffer.toString());
      const parsed = await parsedFile[0];

      const validator = new Validator();
      const errors = await validator.validate(parsed);
      
      if (errors.length > 0)
        throw new BadRequestException(`CSV file is not valid`);

      return parsed;
    }
}
