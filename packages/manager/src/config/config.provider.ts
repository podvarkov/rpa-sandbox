import { Injectable } from "@nestjs/common";
import { plainToClass, Transform } from "class-transformer";
import { validateSync, IsOptional, IsString } from "class-validator";
import { parse as parseUrl } from "url";

@Injectable()
export class ConfigProvider {
  @IsOptional() NODE_ENV?: string;

  @Transform(({ value }) => Number.parseInt(value))
  @IsOptional()
  /**
   * port on which the server is listening
   */
  PORT = 3000;

  /**
   * Url of openaip api
   * @example https://iap.example.com
   */
  @IsString()
  OPENFLOW_URL!: string;

  /**
   * Url of openaip websocket endpoint
   */
  get OPENFLOW_WS_URL(): string {
    const { host, protocol } = parseUrl(this.OPENFLOW_URL);
    return `${protocol === "https:" ? "wss:" : "ws:"}//${host}`;
  }

  /**
   * Username of robot to run workflows
   * @example admin@example.com
   */
  @IsString()
  OPENFLOW_ROBOT_USERNAME!: string;

  /**
   * AES key of openaip instance
   */
  @IsString()
  OPENFLOW_AES_SECRET!: string;
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
