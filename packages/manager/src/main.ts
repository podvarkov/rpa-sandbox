import { NestFactory } from "@nestjs/core";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { AppModule } from "./app.module";
import { ConfigProvider } from "./config/config.provider";
import * as process from "process";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      transports: [new winston.transports.Console()],
      level: process.env.LOG_LEVEL || "info",
    }),
  });
  const port = app.get(ConfigProvider).PORT;
  await app.listen(port || 3000);
}

void bootstrap();
