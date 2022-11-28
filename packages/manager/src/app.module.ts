import { Module, Logger } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./auth/auth.module";
import { OpenflowModule } from "./openflow/openflow.module";
import { TemplatesModule } from "./templates/templates.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ExecutionsModule } from "./executions/executions.module";

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    OpenflowModule,
    TemplatesModule,
    WorkflowsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "static"),
    }),
    ExecutionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
