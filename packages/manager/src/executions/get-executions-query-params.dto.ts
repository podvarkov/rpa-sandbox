import { IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class GetExecutionsQueryParamsDto {
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
  workflowId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderBy? = "startedAt";

  @IsOptional()
  @Transform(({ value }) => (value === "asc" ? 1 : -1))
  direction? = -1;
}
