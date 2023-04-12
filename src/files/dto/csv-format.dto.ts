import { IsDate, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class CSVFormat {
    @Type(() => Date)
    @IsDate()
    // Fecha_compra: Date;
    Purchase_date: Date;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    // Nro_Factura: number;
    Invoice_number: number;

    @Type(() => Number)
    @IsNumber()
    Cod_prod: number;
}
