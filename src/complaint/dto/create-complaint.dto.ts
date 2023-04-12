import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class CreateComplaintDto {
    @IsString()
    @MinLength(5)
    description: string;

    @IsString()
    @MinLength(10)
    problem: string;

    @IsOptional()
    @IsString()
    image?: string;
}
