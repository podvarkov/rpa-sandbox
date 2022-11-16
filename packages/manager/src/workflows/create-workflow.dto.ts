import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CreateWorkflowDto {
  @IsOptional()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  templateId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  @Transform(({ value }) => {
    return Object.entries(value).reduce((acc, [key, val]) => {
      return val !== "" && val != null ? { ...acc, [key]: val } : acc;
    }, {});
  })
  defaultArguments: { [key: string]: unknown };

  @IsOptional()
  @IsString()
  _type = "user_workflow";
}
