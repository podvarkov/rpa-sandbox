import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

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

  @IsOptional()
  @IsObject()
  defaultArguments?: { [key: string]: unknown } = {};

  @IsOptional()
  @IsString()
  _type = "user_workflow";
}
