import { Injectable } from "@nestjs/common";
import { plainToClass, Transform } from "class-transformer";
import { validateSync, IsOptional, IsString } from "class-validator";

@Injectable()
export class ConfigProvider {
  @IsOptional() NODE_ENV?: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  PORT = 3000;

  @IsString()
  OPENFLOW_API_HOST!: string;

  @IsString()
  OPENFLOW_WS_HOST!: string;

  @IsString()
  OPENFLOW_AES_SECRET!: string;

  @IsString()
  OPENFLOW_ROOT_TOKEN!: string;
}

export const configFactory = {
  provide: ConfigProvider,
  useFactory: () => {
    const validatedConfig = plainToClass(ConfigProvider, process.env);

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
      whitelist: true,
    });
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return validatedConfig;
  },
};
