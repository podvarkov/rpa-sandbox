import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsOptional()
  @IsString()
  furiganaSurname: string;

  @IsOptional()
  @IsString()
  furiganaMay: string;
}
