import { Module, Logger } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { join } from "path";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { AuthModule } from "./auth/auth.module";
import { OpenflowModule } from "./openflow/openflow.module";
import { TemplatesModule } from "./templates/templates.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { ExecutionsModule } from "./executions/executions.module";
import { SchedulerModule } from "./scheduler/scheduler.module";
import { ReportsModule } from "./reports/reports.module";
import { StripeModule } from "./stripe/stripe.module";
import { UsersModule } from "./users/users.module";

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
    SchedulerModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ReportsModule,
    StripeModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
