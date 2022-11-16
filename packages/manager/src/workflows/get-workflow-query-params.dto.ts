import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class GetWorkflowQueryParamsDto {
  @IsOptional()
  @Transform(({ value }) => {
    return !!value && value === "true";
  })
  @IsBoolean()
  withTemplate: boolean;
}
