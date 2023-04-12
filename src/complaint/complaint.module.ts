import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';

import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';

import { Complaint, ComplaintImage } from './entities';
import { FilesModule } from 'src/files/files.module';
import { ComplaintResolver } from './complaint.resolver';

@Module({
  controllers: [ComplaintController],
  providers: [ComplaintService, ComplaintResolver],
  imports: [
    TypeOrmModule.forFeature([Complaint, ComplaintImage]),
    AuthModule,
    FilesModule
  ]
})
export class ComplaintModule {}