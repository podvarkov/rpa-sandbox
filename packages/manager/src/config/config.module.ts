import { Global, Module } from "@nestjs/common";
import { configFactory } from "./config.provider";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

@Global()
@Module({
  imports: [NestConfigModule.forRoot()],
  providers: [configFactory],
  exports: [configFactory],
})
export class ConfigModule {}
