import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class ExecuteWorkflowDto {
  @IsNotEmpty()
  @IsString()
  workflowId: string;

  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsObject()
  @Transform(({ value }) => {
    return Object.entries(value).reduce((acc, [key, val]) => {
      return val !== "" && val != null ? { ...acc, [key]: val } : acc;
    }, {});
  })
  arguments: { [key: string]: unknown };
}
