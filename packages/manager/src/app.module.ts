import { Module, Logger } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./auth/auth.module";
import { OpenflowModule } from "src/openflow-commander/openflow.module";
import { TemplatesModule } from "./templates/templates.module";
import { WorkflowsModule } from "./workflows/workflows.module";

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    OpenflowModule,
    TemplatesModule,
    WorkflowsModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
