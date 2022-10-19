import { NestFactory } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { AppModule } from "./app.module";
import { ConfigProvider } from "./config/config.provider";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(winston.format.json()),
      transports: [new winston.transports.Console()],
      level: "debug",
    }),
  });
  const port = app.get(ConfigProvider).PORT;
  await app.listen(port || 3000);
}
bootstrap();
