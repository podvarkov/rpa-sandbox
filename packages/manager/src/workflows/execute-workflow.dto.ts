import { IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";

export class ExecuteWorkflowDto {
  @IsNotEmpty()
  @IsString()
  workflowid: string;

  @IsNotEmpty()
  @IsNumber()
  expiration: number;

  @IsObject()
  arguments: { [key: string]: unknown };
}
