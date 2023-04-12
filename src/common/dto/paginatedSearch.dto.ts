import { IntersectionType } from "@nestjs/mapped-types";
import { PaginationDto } from "./pagination.dto";
import { SearchDto } from "./search.dto";

export class PaginatedSearchDto extends IntersectionType(
    SearchDto,
    PaginationDto
) {}