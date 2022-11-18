import { Module } from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { WorkflowsController } from "./workflows.controller";
import { OpenflowModule } from "../openflow/openflow.module";
import { CryptModule } from "../crypt/crypt.module";

@Module({
  imports: [OpenflowModule, CryptModule],
  providers: [WorkflowsService],
  controllers: [WorkflowsController],
})
export class WorkflowsModule {}
