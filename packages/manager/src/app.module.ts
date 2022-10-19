import { Module, Logger } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./auth/auth.module";
import { OpenflowCommanderModule } from "./openflow-commander/openflow-commander.module";

@Module({
  imports: [ConfigModule, AuthModule, OpenflowCommanderModule],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
