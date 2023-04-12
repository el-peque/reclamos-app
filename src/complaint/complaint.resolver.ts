import { Query, Resolver } from '@nestjs/graphql';
import { ComplaintService } from './complaint.service';
import { Complaint } from './entities';

@Resolver(() => Complaint)
export class ComplaintResolver {
    constructor(private readonly complaintService: ComplaintService) {}

    @Query(() => [Complaint], {name: 'complaints'})
    async findAll() {
        const complaints = await this.complaintService.findAllSimple();
        return complaints
    }
}
