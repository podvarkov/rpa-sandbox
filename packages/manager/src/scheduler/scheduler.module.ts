import { Module } from "@nestjs/common";
import { SchedulerController } from "./scheduler.controller";
import { SchedulerService } from "./scheduler.service";
import { OpenflowModule } from "../openflow/openflow.module";
import { CryptModule } from "src/crypt/crypt.module";
import { WorkflowsModule } from "src/workflows/workflows.module";

@Module({
  imports: [OpenflowModule, CryptModule, WorkflowsModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {}
