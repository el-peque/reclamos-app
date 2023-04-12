import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { PaginatedSearchDto } from '../common/dto';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  @Auth()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'csvFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 },
  ]))
  create(
    @GetUser() user: User,
    @UploadedFiles(new ParseFilePipe({
      fileIsRequired: true,
    })) files: {
      csvFile: Express.Multer.File,
      imageFile: Express.Multer.File},
    @Body() createComplaintDto: CreateComplaintDto
  ) {
    const csvFile = files.csvFile[0];
    const imageFile = files.imageFile[0];
    console.log({csvFile, imageFile});

    const csvExtension = csvFile.mimetype.split('/')[1];
    const imageExtension = imageFile.mimetype.split('/')[1];

    if (csvExtension !== 'csv' || !(['jpg', 'jpeg', 'png'].includes(imageExtension))) {
      throw new BadRequestException(`File type not allowed`);
    }
    return this.complaintService.create(createComplaintDto, user, csvFile, imageFile);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  findAll(@Query() paginatedSearchDto: PaginatedSearchDto) {
    return this.complaintService.findAll(paginatedSearchDto);
  }

  @Get(':term')
  @Auth()
  findOne(@Param('term') term: string) {
    return this.complaintService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateComplaintDto: UpdateComplaintDto) {
    return this.complaintService.update(id, updateComplaintDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.complaintService.remove(id);
  }
}
