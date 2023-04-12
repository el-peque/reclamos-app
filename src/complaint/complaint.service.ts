import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 as uuid, validate as isUUID } from 'uuid';
import { DataSource, Repository } from 'typeorm';

import { Complaint, ComplaintImage } from './entities';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';
import { PaginatedSearchDto } from '../common/dto';
import { User } from '../auth/entities/user.entity';
import { FilesService } from '../files/files.service';
import { CSVFormat } from 'src/files/dto/csv-format.dto';


@Injectable()
export class ComplaintService {
  private readonly logger = new Logger();

  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepository: Repository<Complaint>,

    @InjectRepository(ComplaintImage)
    private readonly complaintImageRepository: Repository<ComplaintImage>,

    private readonly dataSource: DataSource,

    private readonly fileService: FilesService,
  ) {}

  async findAllSimple(): Promise<Complaint[]> {
    const complaints: Complaint[] = await this.complaintRepository.find();
    return complaints;
  }

  async create(
    createComplaintDto: CreateComplaintDto,
    user: User,
    csvFile: Express.Multer.File,
    imageFile: Express.Multer.File,
    ) {
    try {
      const {image = '', ...complaintDetails} = createComplaintDto;
      const imageId = uuid();
      const csvDetails = await this.fileService.parseCsvFile(csvFile.buffer);
      console.log({csvDetails})
      const complaint = this.complaintRepository.create({
        ...complaintDetails,
        ...csvDetails,
        user,
        image: this.complaintImageRepository.create({
          id: imageId,
          url: await this.fileService.uploadPublicFile(imageFile.buffer, imageId)
        })
      });
      await this.complaintRepository.save(complaint);

      return {...complaint}
      // , image: complaint.image.url};
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginatedSearchDto: PaginatedSearchDto) {
    const {limit = 10, offset = 0, search, year, month, day} = paginatedSearchDto;

    const queryBuilder = this.complaintRepository.createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.images', 'images')
      .take(limit)
      .skip(offset)

    if (search) {
      queryBuilder.andWhere(
        'LOWER(description) like :description or LOWER(problem) like :description',
        {description: `%${search.toLowerCase()}%`});
    }
    if (year) {
      queryBuilder.andWhere(
        'EXTRACT(YEAR FROM created_at) = :year',
        {year: year});
    }
    if (month) {
      queryBuilder.andWhere(
        'EXTRACT(MONTH FROM created_at) = :month',
        {month: month});
    }
    if (day) {
      queryBuilder.andWhere(
        'EXTRACT(DAY FROM created_at) = :day',
        {day: day});
    }
    const complaints = await queryBuilder.getMany()
    return complaints.map(complaint => ({
      ...complaint,
      image: complaint.image.url
    }));
  }

  async findOne(term: string) {
    let complaint: Complaint;

    if (isUUID(term)) {
      complaint = await this.complaintRepository.findOneBy({id: term});
    } else {
      complaint = await this.complaintRepository.findOneBy({no: +term});       
    }

    if (!complaint) {
      throw new NotFoundException(`Complaint with term: ${term} not found`);
    }
    return complaint;
  }

  async findOnePlain(term: string) {
    const {image = '', ...complaint} = await this.findOne(term);
    return {
      ...complaint,
      image: image
    }
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto ) {
    const {image: image, ...toUpdate} = updateComplaintDto;

    const complaint = await this.complaintRepository.preload({
      id,
      ...toUpdate,
    });
    if (!complaint) throw new NotFoundException(`Complaint with id: ${ id } not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (image) {
        await queryRunner.manager.delete(ComplaintImage, {complaint: {id}});
        complaint.image = this.complaintImageRepository.create({url: image});
      }
      await queryRunner.manager.save(complaint);
      // await this.complaintRepository.save( complaint );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const complaint = await this.findOne(id);
    await this.complaintRepository.remove(complaint);
  }

  async removeAll() {
    const query = this.complaintRepository.createQueryBuilder('complaint');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs`);
  }
}
