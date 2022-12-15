import { IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class GetEventsQueryParamsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : null))
  top = 50;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : null))
  skip = 0;

  @IsOptional()
  @IsString()
  orderBy = "_created";

  @IsOptional()
  @Transform(({ value }) => (value === "asc" ? 1 : -1))
  direction = -1;
}
