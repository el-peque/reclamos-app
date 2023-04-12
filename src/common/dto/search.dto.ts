import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, IsString, Max, Min, MinLength } from "class-validator";

export class SearchDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    search?: string;

    @IsOptional()
    @Min(1900)
    @Type(() => Number)
    year?: number;

    @IsOptional()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month?: number;

    @IsOptional()
    @Min(1)
    @Max(31)
    @Type(() => Number)
    day?: number; 
}