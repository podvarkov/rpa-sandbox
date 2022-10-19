import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpParamsDto {
  @IsEmail()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
