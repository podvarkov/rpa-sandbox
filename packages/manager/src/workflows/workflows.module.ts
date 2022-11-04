import { Module } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { WorkflowsController } from "./workflows.controller";
import { OpenflowModule } from "src/openflow-commander/openflow.module";

@Module({
  imports: [OpenflowModule],
  providers: [WorkflowsService],
  controllers: [WorkflowsController],
})
export class WorkflowsModule {}
